import { defaultCamera, type Camera } from '../core/Camera';
import { createClock, type Clock } from '../core/Clock';
import { FrameLoop } from '../core/FrameLoop';
import type { FrameStep } from '../core/frameTypes';
import { toScreenPoint, type Point2D, type ScreenPoint, type WorldPoint } from '../core/geometry';
import { createInputStore, type InputStore } from '../core/InputStore';
import {
    createCssColor,
    createDevicePixelRatio,
    type CssColor,
    type DevicePixelRatio,
} from '../core/render';
import type { Circle, DrawStyle, Rectangle, Segment, TextStyle } from '../core/shapes';
import {
    createNonNegativeSeconds,
    createSeconds,
    type NonNegativeSeconds,
    type Seconds,
} from '../core/time';
import { ShapeBatcher } from './batch/ShapeBatcher';
import { createProgram, type Program } from './shader/Program';
import { createStandardUniformValues } from './shader/setUniforms';
import { parseColor } from './shapes/color';
import {
    DEFAULT_FONT_FAMILY,
    TextRasterizer,
    textFragmentSource,
    textUniforms,
} from './shapes/TextRasterizer';
import { createStateBuffer, type StateBuffer } from './StateBuffer';
import type { GpuSurfaceConfig } from './types';

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
    readonly dpr: DevicePixelRatio;
    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;
    readonly input: InputStore;
    readonly clock: Clock;

    readonly #loop: FrameLoop;
    readonly #gl: WebGL2RenderingContext;
    readonly #programs = new Set<Program>();
    readonly #buffers = new Set<StateBuffer>();
    readonly #batch: ShapeBatcher;
    #textRasterizer: TextRasterizer | null = null;
    #textProgram: Program | null = null;
    #cssWidth = 0;
    #cssHeight = 0;
    #lost = false;

    constructor(config: GpuSurfaceConfig) {
        const gl = config.canvas.getContext('webgl2', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
        });

        if (!gl) {
            throw new Error('Glaze: WebGL2 not supported');
        }

        this.canvas = config.canvas;
        this.#gl = gl;
        this.camera = config.camera ?? defaultCamera();
        this.dpr = config.dpr ?? createDevicePixelRatio(1);
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

    /** Pointer position in world coordinates (camera-transformed). */
    get pointer(): WorldPoint {
        return this.camera.screenToWorld(toScreenPoint(this.input.pointer));
    }

    screenToWorld(point: Point2D): WorldPoint {
        return this.camera.screenToWorld(toScreenPoint(point));
    }

    worldToScreen(point: WorldPoint): ScreenPoint {
        return this.camera.worldToScreen(point);
    }

    /** Creates a program owned by this surface: destroyed with it, recompiled on context restore. */
    createProgram(fragmentSource: string, vertexSource?: string): Program {
        const program = createProgram(this.#gl, fragmentSource, vertexSource);

        this.#programs.add(program);

        return program;
    }

    /** Creates a StateBuffer owned by this surface: destroyed with it, recreated on context restore. */
    createStateBuffer(width: number, height: number): StateBuffer {
        const buffer = createStateBuffer(this.#gl, width, height);

        this.#buffers.add(buffer);

        return buffer;
    }

    renderProgram(program: Program): this {
        this.#flushBatch();

        if (this.#lost) {
            return this;
        }

        program.setUniforms(
            createStandardUniformValues(
                this.width,
                this.height,
                this.dpr,
                this.input.pointer,
                this.camera,
                this.time,
                this.clock.time,
            ),
        );
        program.render();

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

        for (const program of this.#programs) {
            program.destroy();
        }

        this.#programs.clear();

        for (const buffer of this.#buffers) {
            buffer.destroy();
        }

        this.#buffers.clear();
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

        program.setUniforms(textUniforms({ x, y }, width, height, size, texture, style));
        this.renderProgram(program);
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

        this.#gl.viewport(0, 0, deviceWidth, deviceHeight);
    }

    #flushBatch(): void {
        if (this.#lost) {
            return;
        }

        this.#batch.flush();
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

        for (const buffer of this.#buffers) {
            buffer.reinitialize();
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
