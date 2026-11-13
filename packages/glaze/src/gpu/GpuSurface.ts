import { createPositiveNumber } from '../core/brands';
import type { PositiveNumber } from '../core/brands';
import { defaultCamera } from '../core/Camera';
import type { Camera } from '../core/Camera';
import { createClock } from '../core/Clock';
import type { Clock } from '../core/Clock';
import { FrameLoop } from '../core/FrameLoop';
import type { FrameStep } from '../core/frameTypes';
import type { Point2D } from '../core/geometry';
import { createInputStore } from '../core/InputStore';
import type { InputStore } from '../core/InputStore';
import { createCssColor } from '../core/render';
import type { CssColor } from '../core/render';
import type { Circle, DrawStyle, Rectangle, Segment, TextStyle } from '../core/shapes';
import { createNonNegativeSeconds, createSeconds } from '../core/time';
import type { NonNegativeSeconds, Seconds } from '../core/time';
import { ShapeBatcher } from './batch/ShapeBatcher';
import { RenderTarget } from './RenderTarget';
import type { RenderTargetOptions } from './RenderTarget';
import { RenderTargetPair } from './RenderTargetPair';
import { createProgram } from './shader/Program';
import type { Program } from './shader/Program';
import { createStandardUniformValues } from './shader/setUniforms';
import { catchShaderError } from './shader/ShaderError';
import { parseColor } from './shapes/color';
import {
    DEFAULT_FONT_FAMILY,
    TextRasterizer,
    textFragmentSource,
    textUniforms,
} from './shapes/TextRasterizer';
import { createStateBuffer } from './StateBuffer';
import type { StateBuffer } from './StateBuffer';
import type { GpuSurfaceConfig, TryProgramResult, UniformValues, Viewport } from './types';
/**
 * WebGL2 surface sharing `CpuSurface`'s chainable, world-space drawing model. Context loss/restore
 * is handled internally.
 */
export class GpuSurface {
    /** Seconds since the frame loop started. */
    time: Seconds = createSeconds(0);
    /** Seconds since the previous frame. */
    deltaTime: NonNegativeSeconds = createNonNegativeSeconds(0);
    frameCount = 0;
    /** CSS pixels, not device pixels — multiply by `dpr` for the backing-buffer size. */
    width = 0;
    height = 0;
    readonly dpr: PositiveNumber;
    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;
    readonly input: InputStore;
    readonly clock: Clock;

    readonly #loop: FrameLoop;
    readonly #gl: WebGL2RenderingContext;
    readonly #programs = new Set<Program>();
    readonly #forget = (program: Program): void => {
        this.#programs.delete(program);
    };
    readonly #buffers = new Set<StateBuffer>();
    readonly #targets = new Set<RenderTarget>();
    readonly #pairs = new Set<RenderTargetPair>();
    readonly #restoreListeners = new Set<(surface: GpuSurface) => void>();
    readonly #batch: ShapeBatcher;
    #textRasterizer: TextRasterizer | null = null;
    #textProgram: Program | null = null;
    #cssWidth = 0;
    #cssHeight = 0;
    #deviceWidth = 0;
    #deviceHeight = 0;
    #lost = false;

    constructor(config: GpuSurfaceConfig) {
        const gl = config.canvas.getContext('webgl2', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            ...config.contextOptions,
        });

        if (!gl) {
            throw new Error('Glaze: WebGL2 not supported');
        }

        this.canvas = config.canvas;
        this.#gl = gl;
        this.camera = config.camera ?? defaultCamera();
        this.dpr = config.dpr ?? createPositiveNumber(1);
        this.clock = config.clock ?? createClock(config.clockOptions);
        this.input = createInputStore();
        this.input.attach(this.canvas);
        this.#batch = new ShapeBatcher({
            gl,
            camera: this.camera,
            getViewport: () => ({ width: this.#cssWidth, height: this.#cssHeight }),
        });
        this.#loop = new FrameLoop(this.#frameStep, config.frameLoopOptions);

        this.#configureState();
        this.#resize();
        this.canvas.addEventListener('webglcontextlost', this.#onContextLost);
        this.canvas.addEventListener('webglcontextrestored', this.#onContextRestored);
    }

    get isRunning(): boolean {
        return this.#loop.isRunning;
    }

    /** True between `webglcontextlost` and `webglcontextrestored`. */
    get isLost(): boolean {
        return this.#lost;
    }

    /** Physical width of the default framebuffer in device pixels. */
    get deviceWidth(): number {
        return this.#deviceWidth;
    }

    /** Physical height of the default framebuffer in device pixels. */
    get deviceHeight(): number {
        return this.#deviceHeight;
    }

    /** Pointer position in world coordinates (camera-transformed). */
    get pointer(): Point2D {
        return this.camera.screenToWorld(this.input.pointer);
    }

    screenToWorld(point: Point2D): Point2D {
        return this.camera.screenToWorld(point);
    }

    worldToScreen(point: Point2D): Point2D {
        return this.camera.worldToScreen(point);
    }

    /** Creates a program owned by this surface: destroyed with it, recompiled on context restore. */
    createProgram(fragmentSource: string, vertexSource?: string): Program {
        const program = createProgram(this.#gl, fragmentSource, vertexSource, this.#forget);

        this.#programs.add(program);

        return program;
    }

    /** Like `createProgram`, but driver error is a value. */
    tryCreateProgram(fragmentSource: string, vertexSource?: string): TryProgramResult {
        const attempt = catchShaderError(() => this.createProgram(fragmentSource, vertexSource));

        if (!attempt.ok) {
            return { ok: false, error: attempt.error };
        }

        return { ok: true, program: attempt.value };
    }

    /** Creates a StateBuffer owned by this surface: destroyed with it, recreated on context restore. */
    createStateBuffer(width: number, height: number): StateBuffer {
        const buffer = createStateBuffer(this.#gl, width, height, (destroyed) => {
            this.#buffers.delete(destroyed);
        });

        this.#buffers.add(buffer);

        return buffer;
    }

    /**
     * Creates a RenderTarget owned by this surface: destroyed with it, recreated on context
     * restore.
     */
    createRenderTarget(width: number, height: number, options?: RenderTargetOptions): RenderTarget {
        const target = new RenderTarget(this.#gl, width, height, options, (destroyed) => {
            this.#targets.delete(destroyed);
        });

        this.#targets.add(target);

        return target;
    }

    /**
     * Creates a RenderTargetPair owned by this surface: destroyed with it, recreated on context
     * restore.
     */
    createRenderTargetPair(
        width: number,
        height: number,
        options?: RenderTargetOptions,
    ): RenderTargetPair {
        const pair = new RenderTargetPair(this.#gl, width, height, options, (destroyed) => {
            this.#pairs.delete(destroyed);
        });

        this.#pairs.add(pair);

        return pair;
    }

    /**
     * Subscribes to context-restore completion. Listeners run after every surface-owned GPU
     * resource has been reinitialized, so they may safely recreate or destroy resources — and must
     * re-seed their own application data, which `glaze` cannot restore.
     */
    onContextRestored(listener: (surface: GpuSurface) => void): () => void {
        this.#restoreListeners.add(listener);

        return () => {
            this.#restoreListeners.delete(listener);
        };
    }

    /** Draw to the default framebuffer (existing behavior, now explicit). */
    renderProgram(program: Program, uniforms?: UniformValues): this {
        return this.renderProgramTo(program, null, uniforms);
    }

    /** Draw to an offscreen target; `null` means the default framebuffer. */
    renderProgramTo(program: Program, target: RenderTarget | null, uniforms?: UniformValues): this {
        this.#flushBatch();

        if (this.#lost) {
            return this;
        }

        const viewport: Viewport = target
            ? { width: target.width, height: target.height }
            : { width: this.#deviceWidth, height: this.#deviceHeight };

        const standardValues = createStandardUniformValues({
            resolution: viewport,
            pointerResolution: { width: this.width, height: this.height },
            dpr: this.dpr,
            mouse: this.input.pointer,
            camera: this.camera,
            time: this.time,
            clockTime: this.clock.time,
        });

        program.setUniforms(uniforms ? { ...standardValues, ...uniforms } : standardValues);

        if (target) {
            target.bindFramebuffer();
        }

        program.render(viewport);

        if (target) {
            this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
            this.#gl.viewport(0, 0, this.#deviceWidth, this.#deviceHeight);
        }

        return this;
    }

    rectangle(rectangle: Rectangle, style?: DrawStyle): this {
        this.#drawRectangle(rectangle, style);

        return this;
    }

    circle(circle: Circle, style?: DrawStyle): this {
        this.#drawCircle(circle, style);

        return this;
    }

    line(segment: Segment, style?: DrawStyle): this {
        this.#drawLine(segment, style);

        return this;
    }

    text(text: string, position: Point2D, style?: TextStyle): this {
        this.#drawText(text, position.x, position.y, style ?? {});

        return this;
    }

    /** Clears the framebuffer with a CSS color — same signature as `CpuSurface.clear`. */
    clear(color?: CssColor): this {
        this.#flushBatch();

        if (this.#lost) {
            return this;
        }

        const { r, g, b, a } = parseColor(color ?? createCssColor('#000000'));

        this.#gl.clearColor(r, g, b, a);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

        return this;
    }

    /** Subscribes to the frame loop; the rAF loop runs while at least one subscription is live. */
    onFrame(callback: (surface: this) => void): () => void {
        const wrapped = (): void => {
            callback(this);
        };

        return this.#loop.subscribe(wrapped);
    }

    destroy(): void {
        this.#loop.dispose();
        this.input.destroy();
        this.canvas.removeEventListener('webglcontextlost', this.#onContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this.#onContextRestored);

        // Snapshots: destroy hooks remove their resource from these sets while we iterate.
        for (const program of new Set(this.#programs)) {
            program.destroy();
        }

        this.#programs.clear();

        for (const target of new Set(this.#targets)) {
            target.destroy();
        }

        this.#targets.clear();

        for (const pair of new Set(this.#pairs)) {
            pair.destroy();
        }

        this.#pairs.clear();

        for (const buffer of new Set(this.#buffers)) {
            buffer.destroy();
        }

        this.#buffers.clear();
        this.#restoreListeners.clear();
        this.#textProgram = null;
        this.#batch.destroy();
        this.#textRasterizer?.destroy();
        this.#textRasterizer = null;
    }

    #drawCircle(circle: Circle, style?: DrawStyle): void {
        if (this.#lost) {
            return;
        }

        this.#batch.drawCircle(circle, style ?? {});
    }

    #drawRectangle(rectangle: Rectangle, style?: DrawStyle): void {
        if (this.#lost) {
            return;
        }

        this.#batch.drawRectangle(rectangle, style ?? {});
    }

    #drawLine(segment: Segment, style?: DrawStyle): void {
        if (this.#lost) {
            return;
        }

        this.#batch.drawLine(segment, style ?? {});
    }

    #drawText(text: string, x: number, y: number, style: TextStyle): void {
        if (this.#lost || text.length === 0) {
            return;
        }

        this.#flushBatch();
        const rasterizer = (this.#textRasterizer ??= new TextRasterizer(this.#gl));
        const size = style.fontSize ?? 16;
        const font = `${String(size)}px ${style.fontFamily ?? DEFAULT_FONT_FAMILY}`;
        const { texture, width, height } = rasterizer.get(text, font, size);
        const program = this.#getTextProgram();

        this.renderProgram(program, textUniforms({ x, y }, width, height, size, texture, style));
    }

    #getTextProgram(): Program {
        if (this.#textProgram === null) {
            this.#textProgram = this.createProgram(textFragmentSource);
        }

        return this.#textProgram;
    }

    #configureState(): void {
        this.#gl.disable(this.#gl.DEPTH_TEST);
        this.#gl.enable(this.#gl.BLEND);
        this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);
    }

    #resize(): void {
        this.#cssWidth = Math.max(1, this.canvas.clientWidth);
        this.#cssHeight = Math.max(1, this.canvas.clientHeight);
        const deviceWidth = Math.round(this.#cssWidth * this.dpr);
        const deviceHeight = Math.round(this.#cssHeight * this.dpr);

        if (this.canvas.width !== deviceWidth) {
            this.canvas.width = deviceWidth;
        }

        if (this.canvas.height !== deviceHeight) {
            this.canvas.height = deviceHeight;
        }

        this.#deviceWidth = deviceWidth;
        this.#deviceHeight = deviceHeight;
        this.#gl.viewport(0, 0, deviceWidth, deviceHeight);
    }

    #flushBatch(): void {
        if (this.#lost) {
            return;
        }

        this.#batch.flush({ width: this.#deviceWidth, height: this.#deviceHeight });
    }

    #onContextLost = (event: Event): void => {
        event.preventDefault();
        this.#lost = true;
    };

    #onContextRestored = (): void => {
        this.#lost = false;
        this.#configureState();
        this.#resize();
        this.#textRasterizer?.clear();
        this.#batch.reinitialize();

        for (const program of this.#programs) {
            program.reinitialize();
        }

        for (const target of new Set(this.#targets)) {
            target.reinitialize();
        }

        for (const pair of new Set(this.#pairs)) {
            pair.reinitialize();
        }

        for (const buffer of new Set(this.#buffers)) {
            buffer.reinitialize();
        }

        for (const listener of new Set(this.#restoreListeners)) {
            listener(this);
        }
    };

    #frameStep: FrameStep = (time, deltaTime, frameToken): void => {
        this.#resize();
        this.frameCount++;
        this.time = time;
        this.deltaTime = deltaTime;
        this.width = this.#cssWidth;
        this.height = this.#cssHeight;
        this.clock.update(deltaTime);

        this.#loop.runFrameSubscribers();
        this.#flushBatch();
        this.input.endFrame(frameToken);
    };
}

export function createGpuSurface(config: GpuSurfaceConfig): GpuSurface {
    return new GpuSurface(config);
}
