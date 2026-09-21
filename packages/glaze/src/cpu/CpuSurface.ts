import { defaultCamera, type Camera } from '../core/Camera';
import { FrameLoop } from '../core/FrameLoop';
import type { FrameStep } from '../core/frameTypes';
import { toScreenPoint, type Point2D, type ScreenPoint, type WorldPoint } from '../core/geometry';
import { createInputStore, type InputStore } from '../core/InputStore';
import {
    createCanvasDimension,
    createDevicePixelRatio,
    type CanvasDimension,
    type CssColor,
    type DevicePixelRatio,
    type FontSize,
    type PositiveNumber,
} from '../core/render';
import {
    type Circle,
    type DrawStyle,
    type PathOptions,
    type Rectangle,
    type Segment,
    type TextStyle,
} from '../core/shapes';
import {
    createNonNegativeSeconds,
    createSeconds,
    type NonNegativeSeconds,
    type Seconds,
} from '../core/time';
import type { CpuSurfaceConfig } from './types';

const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_FONT_FAMILY = 'sans-serif';

/**
 * Immediate-mode Canvas2D drawing in world space; `applyCamera()` runs automatically before each
 * frame's callback.
 */
export class CpuSurface {
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

    readonly #loop: FrameLoop;
    readonly #context: CanvasRenderingContext2D;
    #cssWidth: CanvasDimension = createCanvasDimension(1);
    #cssHeight: CanvasDimension = createCanvasDimension(1);

    constructor(config: CpuSurfaceConfig) {
        const context = config.canvas.getContext('2d');

        if (!context) throw new Error('Glaze: Canvas2D context unavailable');

        this.canvas = config.canvas;
        this.#context = context;
        this.camera = config.camera ?? defaultCamera();
        this.dpr = config.dpr ?? createDevicePixelRatio(1);
        this.input = createInputStore();
        this.input.attach(this.canvas);
        this.#loop = new FrameLoop(this.#frameStep, config.frameLoopOptions);

        // Size the canvas once up front so one-shot draws made outside the frame loop survive
        // (the loop's first resize would otherwise clear the buffer).
        this.#resize();
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

    /** Subscribes to the frame loop; the rAF loop runs while at least one subscription is live. */
    onFrame(callback: (surface: this) => void): () => void {
        const wrapped = (): void => {
            callback(this);
        };

        return this.#loop.subscribe(wrapped);
    }

    clear(color: CssColor): this {
        const context = this.#context;

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = color;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();

        return this;
    }

    /** Applied automatically each frame; call manually before one-shot draws outside the loop. */
    applyCamera(): this {
        if (this.width === 0) return this;

        const context = this.#context;

        // World → CSS transform (zoom + camera offset), then into device pixels (`dpr`): the
        // translation must be scaled too, or the scene drifts by `dpr` on hidpi displays.
        context.setTransform(
            this.camera.zoom * this.dpr,
            0,
            0,
            this.camera.zoom * this.dpr,
            this.camera.x * this.dpr,
            this.camera.y * this.dpr,
        );

        return this;
    }

    rectangle(rectangle: Rectangle, style?: DrawStyle): this {
        this.#begin(style?.fill, style?.stroke, style?.lineWidth);
        this.#context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.#paintShape(style?.fill, style?.stroke);

        return this;
    }

    circle(circle: Circle, style?: DrawStyle): this {
        this.#begin(style?.fill, style?.stroke, style?.lineWidth);
        this.#context.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
        this.#paintShape(style?.fill, style?.stroke);

        return this;
    }

    line(segment: Segment, style?: DrawStyle): this {
        this.#strokeLine(
            segment.a.x,
            segment.a.y,
            segment.b.x,
            segment.b.y,
            style?.stroke,
            style?.lineWidth,
        );

        return this;
    }

    text(text: string, position: Point2D, style?: TextStyle): this {
        this.#drawText(text, position.x, position.y, style?.fill, style?.fontSize, style);

        return this;
    }

    path(points: readonly Point2D[], style?: DrawStyle, options?: PathOptions): this {
        this.#drawPath(
            points,
            style?.fill,
            style?.stroke,
            style?.lineWidth,
            options?.closed,
            options,
        );

        return this;
    }

    destroy(): void {
        this.#loop.dispose();
        this.input.destroy();
    }

    #frameStep: FrameStep = (time, deltaTime, frameToken): void => {
        this.#resize();
        this.frameCount++;
        this.#stampFrameState(time, deltaTime);
        this.applyCamera();
        this.#loop.runFrameSubscribers();
        this.input.endFrame(frameToken);
    };

    #stampFrameState(time: Seconds, deltaTime: NonNegativeSeconds): void {
        this.time = time;
        this.deltaTime = deltaTime;
        this.width = this.#cssWidth;
        this.height = this.#cssHeight;
    }

    #resize(): void {
        this.#cssWidth = createCanvasDimension(Math.max(1, this.canvas.clientWidth));
        this.#cssHeight = createCanvasDimension(Math.max(1, this.canvas.clientHeight));
        const deviceWidth = Math.round(this.#cssWidth * this.dpr);
        const deviceHeight = Math.round(this.#cssHeight * this.dpr);

        if (this.canvas.width !== deviceWidth) this.canvas.width = deviceWidth;

        if (this.canvas.height !== deviceHeight) this.canvas.height = deviceHeight;
    }

    #begin(fill?: CssColor, stroke?: CssColor, lineWidth?: PositiveNumber): void {
        const context = this.#context;

        context.beginPath();

        if (fill) context.fillStyle = fill;

        if (stroke) {
            context.strokeStyle = stroke;
            context.lineWidth = lineWidth ?? DEFAULT_STROKE_WIDTH;
            context.lineJoin = 'round';
            context.lineCap = 'round';
        }
    }

    #paintShape(fill?: CssColor, stroke?: CssColor, options?: PathOptions): void {
        const doFill = options?.fill ?? fill !== undefined;
        const doStroke = options?.stroke ?? stroke !== undefined;

        if (doFill && fill) this.#context.fill();

        if (doStroke && stroke) this.#context.stroke();
    }

    #strokeLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        stroke?: CssColor,
        lineWidth?: PositiveNumber,
    ): void {
        const context = this.#context;

        context.beginPath();
        context.strokeStyle = stroke ?? '#000000';
        context.lineWidth = lineWidth ?? DEFAULT_STROKE_WIDTH;
        context.lineCap = 'round';
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    #drawText(
        text: string,
        x: number,
        y: number,
        fill: CssColor | undefined,
        fontSize: FontSize | undefined,
        style?: TextStyle,
    ): void {
        const context = this.#context;
        const size = String(fontSize ?? 16);

        context.font = `${size}px ${style?.fontFamily ?? DEFAULT_FONT_FAMILY}`;
        context.textAlign = style?.align ?? 'left';
        context.textBaseline = style?.baseline ?? 'alphabetic';

        if (style?.stroke) {
            context.lineWidth = style.lineWidth ?? DEFAULT_STROKE_WIDTH;
            context.strokeStyle = style.stroke;
            context.strokeText(text, x, y);
        }

        if (fill) {
            context.fillStyle = fill;
            context.fillText(text, x, y);
        }
    }

    #drawPath(
        points: readonly Point2D[],
        fill?: CssColor,
        stroke?: CssColor,
        lineWidth?: PositiveNumber,
        closed?: boolean,
        options?: PathOptions,
    ): void {
        if (points.length < 2) return;

        this.#begin(fill, stroke, lineWidth);
        const context = this.#context;
        const first = points[0];

        context.moveTo(first.x, first.y);

        for (let i = 1; i < points.length; i++) {
            const point = points[i];

            context.lineTo(point.x, point.y);
        }

        if (options?.closed ?? closed) context.closePath();

        this.#paintShape(fill, stroke, options);
    }
}

export function createCpuSurface(config: CpuSurfaceConfig): CpuSurface {
    return new CpuSurface(config);
}
