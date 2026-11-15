import { applyCanvasSize, measureCanvas } from '../core/canvasSize';
import type { CanvasSize } from '../core/canvasSize';
import { Clock } from '../core/Clock';
import { FrameLoop } from '../core/FrameLoop';

type FrameCallback = (surface: CpuSurface) => void;

export interface CpuSurfaceOptions {
    /**
     * Pixel ratio override. When omitted, `window.devicePixelRatio` is read each frame, falling
     * back to 1 when `window` is unavailable (SSR).
     */
    dpr?: number;
    /** Clock source for the frame loop. Defaults to `performance.now`. */
    now?: () => number;
    /** Frame scheduler. Defaults to `requestAnimationFrame`. */
    schedule?: (callback: (time: number) => void) => () => void;
}

/**
 * CpuSurface owns a Canvas2D context, the frame loop, resize, and the device-pixel transform.
 *
 * Size contract: `width`/`height` are CSS pixels (layout and drawing space for the application),
 * while `deviceWidth`/`deviceHeight` are physical pixels (the canvas backing store). Drawing code
 * therefore works in CSS pixels: after every resize the context is reset to `setTransform(dpr, 0,
 * 0, dpr, 0, 0)` before subscribers run.
 *
 * The surface never clears the canvas: clearing is the application's render policy.
 */
export class CpuSurface {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly clock: Clock;

    readonly #loop: FrameLoop;
    readonly #dprOverride: number | undefined;

    #size: CanvasSize = { width: 0, height: 0, deviceWidth: 0, deviceHeight: 0, dpr: 1 };
    #frameCount = 0;
    #destroyed = false;

    constructor(canvas: HTMLCanvasElement, options: CpuSurfaceOptions = {}) {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('CpuSurface: Canvas2D is not supported in this environment.');
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.clock = new Clock();
        this.#dprOverride = options.dpr;

        // Frame step: resize (which re-applies the DPR transform), tick the clock, then fan out to
        // subscribers. Subscribers draw in CSS pixels and in an order they fully control.
        this.#loop = new FrameLoop(
            (_time, delta) => {
                this.#resize();
                this.clock.update(delta);
                this.#frameCount++;
                this.#loop.runFrameSubscribers();
            },
            { now: options.now, schedule: options.schedule },
        );

        // Size once up front so one-shot drawing works outside the frame loop (a later resize would
        // otherwise reset the backing store and erase that drawing).
        this.#resize();
    }

    // -------------------------------------------------------------------------
    // Public state

    /** Canvas width in CSS pixels. */
    get width(): number {
        return this.#size.width;
    }

    /** Canvas height in CSS pixels. */
    get height(): number {
        return this.#size.height;
    }

    /** Canvas width in physical pixels (the backing store size). */
    get deviceWidth(): number {
        return this.#size.deviceWidth;
    }

    /** Canvas height in physical pixels (the backing store size). */
    get deviceHeight(): number {
        return this.#size.deviceHeight;
    }

    /** Device pixel ratio used for the last resize. */
    get dpr(): number {
        return this.#size.dpr;
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
    // Frame loop subscription

    /**
     * Subscribes to the frame loop. Returns an unsubscribe function. The loop starts on the first
     * subscriber and stops on the last. The callback receives this CpuSurface instance on each
     * frame.
     */
    onFrame(callback: FrameCallback): () => void {
        if (this.#destroyed) {
            return () => {};
        }

        return this.#loop.subscribe(() => {
            callback(this);
        });
    }

    // -------------------------------------------------------------------------
    // Drawing

    /**
     * Clears the whole canvas, or fills it with `color`. The current transform is preserved and
     * `globalAlpha` / `globalCompositeOperation` are neutralised for the operation only, so a clear
     * never inherits the drawing state of the frame before.
     */
    clear(color?: string): void {
        if (this.#destroyed) {
            return;
        }

        const { ctx, deviceWidth, deviceHeight } = this;

        if (deviceWidth === 0 || deviceHeight === 0) {
            return;
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        if (color === undefined) {
            ctx.clearRect(0, 0, deviceWidth, deviceHeight);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, deviceWidth, deviceHeight);
        }

        ctx.restore();
    }

    // -------------------------------------------------------------------------
    // Lifecycle

    /** Implements the NodeDisposable interface used by `useNodeResource`. */
    dispose(): void {
        this.destroy();
    }

    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#loop.dispose();
    }

    // -------------------------------------------------------------------------
    // Private

    #resize(): void {
        const size = measureCanvas(this.canvas, this.#dprOverride);

        this.#size = size;
        applyCanvasSize(this.canvas, size);

        // Assigning the backing-store size resets the context state, so the DPR transform is
        // (re)applied every frame — not only when the size changed.
        this.ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    }
}
