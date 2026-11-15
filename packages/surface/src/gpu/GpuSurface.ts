import { applyCanvasSize, measureCanvas } from '../core/canvasSize';
import { Clock } from '../core/Clock';
import { FrameLoop } from '../core/FrameLoop';
import { Program } from './Program';
import { RenderTarget } from './RenderTarget';
import type { RenderTargetOptions } from './RenderTarget';
import { buildStandardUniforms } from './setUniforms';
import { ShaderError } from './ShaderError';
import { TargetPair } from './TargetPair';
import type { UniformValue } from './types';

export type { UniformValue, RenderTargetOptions };

type FrameCallback = (surface: GpuSurface) => void;
type ContextRestoredCallback = (surface: GpuSurface) => void;

/**
 * Mouse state following Shadertoy iMouse semantics. Positions are stored in CSS pixels (the input
 * space) and converted to device pixels when uploaded as `iMouse`.
 */
interface MouseState {
    /** Current position (CSS pixels) when button is pressed, else 0,0. */
    x: number;
    y: number;
    /** Last click position (CSS pixels). */
    clickX: number;
    clickY: number;
    /** Whether a button is currently pressed. */
    pressed: boolean;
}

/**
 * GpuSurface manages a WebGL2 context, the frame loop, resize, context loss, and mouse tracking. It
 * follows the Shadertoy uniform contract (iResolution, iTime, iTimeDelta, iFrame, iMouse).
 *
 * Size contract: `width`/`height` are CSS pixels (layout and pointer space), while
 * `deviceWidth`/`deviceHeight` are physical pixels (drawing buffer and `iResolution` space).
 *
 * Resource ownership: `RenderTarget` and `TargetPair` created via `createRenderTarget` /
 * `createTargetPair` are tracked by the surface. They are destroyed automatically with the surface
 * and reinitialised (GPU objects recreated) on WebGL context restore. Calling `.destroy()` on a
 * target removes it from tracking; the surface will not touch it again.
 *
 * Sampler arrays (`sampler2D[]`): not currently supported by `setUniforms`. Each texture must be
 * bound to its own named uniform (e.g. `u_orbit`, `u_orbit2`). Explicit support can be added when a
 * concrete app requires it.
 */
export class GpuSurface {
    readonly canvas: HTMLCanvasElement;
    readonly clock: Clock;

    readonly #gl: WebGL2RenderingContext;
    readonly #loop: FrameLoop;
    readonly #contextRestoredCallbacks = new Set<ContextRestoredCallback>();
    readonly #programs = new Set<Program>();
    readonly #renderTargets = new Set<RenderTarget>();
    readonly #targetPairs = new Set<TargetPair>();

    #frameCount = 0;
    #width = 0;
    #height = 0;
    #deviceWidth = 0;
    #deviceHeight = 0;
    #dpr = 1;
    #destroyed = false;

    // iMouse state
    #mouse: MouseState = { x: 0, y: 0, clickX: 0, clickY: 0, pressed: false };

    // Bound event listeners (for cleanup)
    readonly #onContextLost: (e: Event) => void;
    readonly #onContextRestored: (e: Event) => void;
    readonly #onPointerDown: (e: PointerEvent) => void;
    readonly #onPointerMove: (e: PointerEvent) => void;
    readonly #onPointerUp: (e: PointerEvent) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.clock = new Clock();

        const gl = canvas.getContext('webgl2');

        if (!gl) {
            throw new Error('GpuSurface: WebGL2 is not supported in this environment.');
        }

        this.#gl = gl;

        // Frame loop step: resize, tick clock, then fan out to subscribers.
        this.#loop = new FrameLoop((_time, delta) => {
            this.#resize();
            this.clock.update(delta);
            this.#frameCount++;
            this.#loop.runFrameSubscribers();
        });

        // Context loss handling
        this.#onContextLost = (e: Event) => {
            e.preventDefault();
        };

        this.#onContextRestored = () => {
            // Re-initialize all tracked programs
            for (const program of this.#programs) {
                try {
                    program.reinitialize();
                } catch {
                    // If a program can't be restored, skip it gracefully
                }
            }

            // Re-initialize all tracked render targets
            for (const target of this.#renderTargets) {
                try {
                    target.reinitialize();
                } catch {
                    // Skip gracefully — a failed target is unusable but shouldn't crash the restore
                }
            }

            // Re-initialize all tracked target pairs
            for (const pair of this.#targetPairs) {
                try {
                    pair.reinitialize();
                } catch {
                    // Skip gracefully
                }
            }

            // Notify listeners
            const snapshot = new Set(this.#contextRestoredCallbacks);
            for (const cb of snapshot) {
                cb(this);
            }
        };

        // Mouse tracking for iMouse (Y is flipped: Shadertoy origin is bottom-left)
        this.#onPointerDown = (e: PointerEvent) => {
            this.canvas.setPointerCapture(e.pointerId);
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = rect.height - (e.clientY - rect.top);

            this.#mouse = { x, y, clickX: x, clickY: y, pressed: true };
        };

        this.#onPointerMove = (e: PointerEvent) => {
            if (!this.#mouse.pressed) {
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = rect.height - (e.clientY - rect.top);

            this.#mouse = { ...this.#mouse, x, y };
        };

        this.#onPointerUp = () => {
            // On release: xy goes to 0,0 but clickX/Y keeps last click position
            this.#mouse = { ...this.#mouse, x: 0, y: 0, pressed: false };
        };

        canvas.addEventListener('webglcontextlost', this.#onContextLost);
        canvas.addEventListener('webglcontextrestored', this.#onContextRestored);
        canvas.addEventListener('pointerdown', this.#onPointerDown);
        canvas.addEventListener('pointermove', this.#onPointerMove);
        canvas.addEventListener('pointerup', this.#onPointerUp);
    }

    // -------------------------------------------------------------------------
    // Public state

    get gl(): WebGL2RenderingContext {
        return this.#gl;
    }

    /** Canvas width in CSS pixels. */
    get width(): number {
        return this.#width;
    }

    /** Canvas height in CSS pixels. */
    get height(): number {
        return this.#height;
    }

    /** Canvas width in physical pixels (the drawing buffer size). */
    get deviceWidth(): number {
        return this.#deviceWidth;
    }

    /** Canvas height in physical pixels (the drawing buffer size). */
    get deviceHeight(): number {
        return this.#deviceHeight;
    }

    /** Device pixel ratio used for the last resize. */
    get dpr(): number {
        return this.#dpr;
    }

    get time(): number {
        return this.clock.time;
    }

    get deltaTime(): number {
        return this.clock.deltaTime;
    }

    get frameCount(): number {
        return this.#frameCount;
    }

    // -------------------------------------------------------------------------
    // Program API

    /**
     * Compiles a Shadertoy-compatible fragment shader. Throws `ShaderError` on failure. The
     * resulting program is tracked for context-restore reinitialisation.
     */
    createProgram(fragmentSource: string): Program {
        const program = new Program(this.#gl, fragmentSource, undefined, (p) => {
            this.#programs.delete(p);
        });

        this.#programs.add(program);
        return program;
    }

    /** Like `createProgram` but returns a discriminated union instead of throwing. */
    tryCreateProgram(
        fragmentSource: string,
    ): { ok: true; program: Program } | { ok: false; error: ShaderError } {
        try {
            return { ok: true, program: this.createProgram(fragmentSource) };
        } catch (error) {
            if (error instanceof ShaderError) {
                return { ok: false, error };
            }
            throw error;
        }
    }

    /**
     * Creates an offscreen RGBA8 render target owned by this surface. The target is automatically
     * destroyed with the surface and reinitialised on WebGL context restore. Calling `.destroy()`
     * on the returned target removes it from surface tracking.
     */
    createRenderTarget(width: number, height: number, options?: RenderTargetOptions): RenderTarget {
        const target = new RenderTarget(this.#gl, width, height, options, (t) => {
            this.#renderTargets.delete(t);
        });

        this.#renderTargets.add(target);
        return target;
    }

    /**
     * Creates a ping-pong `TargetPair` owned by this surface. The pair is automatically destroyed
     * with the surface and reinitialised on WebGL context restore. Calling `.destroy()` on the
     * returned pair removes it from surface tracking.
     */
    createTargetPair(width: number, height: number, options?: RenderTargetOptions): TargetPair {
        const pair = new TargetPair(this.#gl, width, height, options, (p) => {
            this.#targetPairs.delete(p);
        });

        this.#targetPairs.add(pair);
        return pair;
    }

    /**
     * Renders a program with the standard Shadertoy uniforms auto-injected. Pass `extraUniforms`
     * for any application-specific uniforms on top.
     */
    renderProgram(program: Program, extraUniforms?: Record<string, UniformValue>): void {
        // Mouse positions are tracked in CSS pixels and converted here to match iResolution.
        const { dpr } = this;
        const standardUniforms = buildStandardUniforms({
            width: this.#deviceWidth,
            height: this.#deviceHeight,
            time: this.clock.time,
            timeDelta: this.clock.deltaTime,
            frame: this.#frameCount,
            mouse: [
                this.#mouse.pressed ? this.#mouse.x * dpr : 0,
                this.#mouse.pressed ? this.#mouse.y * dpr : 0,
                this.#mouse.clickX * dpr,
                this.#mouse.clickY * dpr,
            ],
        });

        const allUniforms = extraUniforms
            ? { ...standardUniforms, ...extraUniforms }
            : standardUniforms;

        program.setUniforms(allUniforms);
        program.render(this.#deviceWidth, this.#deviceHeight);
    }

    /** Renders a program into an offscreen RenderTarget. */
    renderTo(
        target: RenderTarget,
        program: Program,
        extraUniforms?: Record<string, UniformValue>,
    ): void {
        const standardUniforms = buildStandardUniforms({
            width: target.width,
            height: target.height,
            time: this.clock.time,
            timeDelta: this.clock.deltaTime,
            frame: this.#frameCount,
            mouse: [0, 0, 0, 0],
        });

        const allUniforms = extraUniforms
            ? { ...standardUniforms, ...extraUniforms }
            : standardUniforms;

        target.bind();
        program.setUniforms(allUniforms);
        program.render(target.width, target.height);
        target.unbind();
    }

    // -------------------------------------------------------------------------
    // Frame loop subscription

    /**
     * Subscribe to the frame loop. Returns an unsubscribe function. The loop starts on the first
     * subscriber and stops on the last. The callback receives this GpuSurface instance on each
     * frame.
     */
    onFrame(cb: FrameCallback): () => void {
        return this.#loop.subscribe(() => {
            cb(this);
        });
    }

    /** Register a callback fired after WebGL context is restored. Returns a cleanup function. */
    onContextRestored(cb: ContextRestoredCallback): () => void {
        this.#contextRestoredCallbacks.add(cb);
        return () => {
            this.#contextRestoredCallbacks.delete(cb);
        };
    }

    // -------------------------------------------------------------------------
    // Lifecycle

    /** Implements StackDisposable interface for useNodeResource compatibility. */
    dispose(): void {
        this.destroy();
    }

    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#loop.dispose();

        for (const program of this.#programs) {
            program.destroy();
        }

        this.#programs.clear();

        for (const target of this.#renderTargets) {
            target.destroy();
        }

        this.#renderTargets.clear();

        for (const pair of this.#targetPairs) {
            pair.destroy();
        }

        this.#targetPairs.clear();

        this.canvas.removeEventListener('webglcontextlost', this.#onContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this.#onContextRestored);
        this.canvas.removeEventListener('pointerdown', this.#onPointerDown);
        this.canvas.removeEventListener('pointermove', this.#onPointerMove);
        this.canvas.removeEventListener('pointerup', this.#onPointerUp);
    }

    // -------------------------------------------------------------------------
    // Private

    #resize(): void {
        const size = measureCanvas(this.canvas);

        this.#dpr = size.dpr;
        this.#width = size.width;
        this.#height = size.height;
        this.#deviceWidth = size.deviceWidth;
        this.#deviceHeight = size.deviceHeight;

        applyCanvasSize(this.canvas, size);
    }
}
