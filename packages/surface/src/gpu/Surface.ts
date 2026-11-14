import { Clock } from '../core/Clock';
import { FrameLoop } from '../core/FrameLoop';
import { Program } from './Program';
import { buildStandardUniforms } from './setUniforms';
import { ShaderError } from './ShaderError';
import type { UniformValue } from './types';

export type { UniformValue };

type FrameCallback = (surface: Surface) => void;
type ContextRestoredCallback = (surface: Surface) => void;

/** Mouse state following Shadertoy iMouse semantics. */
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
 * Surface manages a WebGL2 context, the frame loop, resize, context loss, and mouse tracking. It
 * follows the Shadertoy uniform contract (iResolution, iTime, iTimeDelta, iFrame, iMouse).
 */
export class Surface {
    readonly canvas: HTMLCanvasElement;
    readonly clock: Clock;

    readonly #gl: WebGL2RenderingContext;
    readonly #loop: FrameLoop;
    readonly #contextRestoredCallbacks = new Set<ContextRestoredCallback>();
    readonly #programs = new Set<Program>();

    #frameCount = 0;
    #width = 0;
    #height = 0;
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
            throw new Error('Surface: WebGL2 is not supported in this environment.');
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

    get width(): number {
        return this.#width;
    }

    get height(): number {
        return this.#height;
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
     * Renders a program with the standard Shadertoy uniforms auto-injected. Pass `extraUniforms`
     * for any application-specific uniforms on top.
     */
    renderProgram(program: Program, extraUniforms?: Record<string, UniformValue>): void {
        const standardUniforms = buildStandardUniforms({
            width: this.#width,
            height: this.#height,
            time: this.clock.time,
            timeDelta: this.clock.deltaTime,
            frame: this.#frameCount,
            mouse: [
                this.#mouse.pressed ? this.#mouse.x : 0,
                this.#mouse.pressed ? this.#mouse.y : 0,
                this.#mouse.clickX,
                this.#mouse.clickY,
            ],
        });

        const allUniforms = extraUniforms
            ? { ...standardUniforms, ...extraUniforms }
            : standardUniforms;

        program.setUniforms(allUniforms);
        program.render(this.#width, this.#height);
    }

    // -------------------------------------------------------------------------
    // Frame loop subscription

    /**
     * Subscribe to the frame loop. Returns an unsubscribe function. The loop starts on the first
     * subscriber and stops on the last. The callback receives this Surface instance on each frame.
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
        this.canvas.removeEventListener('webglcontextlost', this.#onContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this.#onContextRestored);
        this.canvas.removeEventListener('pointerdown', this.#onPointerDown);
        this.canvas.removeEventListener('pointermove', this.#onPointerMove);
        this.canvas.removeEventListener('pointerup', this.#onPointerUp);
    }

    // -------------------------------------------------------------------------
    // Private

    #resize(): void {
        const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
        const w = Math.round(this.canvas.clientWidth * dpr);
        const h = Math.round(this.canvas.clientHeight * dpr);

        if (w !== this.#width || h !== this.#height) {
            this.#width = w;
            this.#height = h;
            this.canvas.width = w;
            this.canvas.height = h;
        }
    }
}
