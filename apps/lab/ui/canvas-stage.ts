/*
 * Shared canvas lifecycle for experiments that draw in 2D.
 *
 * The canvas element lives in static HTML and is never recreated: this helper
 * owns the requestAnimationFrame loop (FrameLoop), the DPR-aware backing store
 * (measureCanvas / applyCanvasSize) and a ResizeObserver. The loop starts with
 * the first subscriber and stops with the last one, so a paused experiment is
 * completely idle.
 */

import { applyCanvasSize, measureCanvas } from '../lib/surface/core/canvasSize';
import type { CanvasSize } from '../lib/surface/core/canvasSize';
import { FrameLoop } from '../lib/surface/core/FrameLoop';

export interface Frame {
    readonly context: CanvasRenderingContext2D;
    readonly size: CanvasSize;
    readonly time: number;
    readonly delta: number;
    readonly frame: number;
}

export type CanvasRenderer = (frame: Frame) => void;

export interface CanvasStageOptions {
    /** Called once after any size change, even while paused. */
    onResize?: (size: CanvasSize) => void;
}

export class CanvasStage {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;

    readonly #renderers = new Set<CanvasRenderer>();
    readonly #loop: FrameLoop;
    readonly #resizeObserver: ResizeObserver | null;
    readonly #onResize: ((size: CanvasSize) => void) | undefined;

    #size: CanvasSize;
    #stopLoop: (() => void) | null = null;
    #time = 0;
    #delta = 0;
    #frame = 0;
    #destroyed = false;

    constructor(canvas: HTMLCanvasElement, options: CanvasStageOptions = {}) {
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('CanvasStage: unable to acquire a 2D context.');
        }

        this.canvas = canvas;
        this.context = context;
        this.#onResize = options.onResize;
        this.#size = measureCanvas(canvas);

        this.#loop = new FrameLoop((time, delta) => {
            this.#time = time;
            this.#delta = delta;
            this.#frame++;
        });

        this.#resizeObserver =
            typeof ResizeObserver === 'undefined'
                ? null
                : new ResizeObserver(() => {
                      this.resize();
                  });
        this.#resizeObserver?.observe(canvas);

        this.resize();
    }

    get size(): CanvasSize {
        return this.#size;
    }

    get isRunning(): boolean {
        return this.#loop.isRunning;
    }

    get hasRenderers(): boolean {
        return this.#renderers.size > 0;
    }

    /** Recomputes the DPR-aware backing store and repaints once while paused. */
    resize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#size = measureCanvas(this.canvas);
        applyCanvasSize(this.canvas, this.#size);

        // All renderers draw in CSS pixels; the transform maps them to physical pixels.
        this.context.setTransform(this.#size.dpr, 0, 0, this.#size.dpr, 0, 0);

        this.#onResize?.(this.#size);
        this.#draw();
    }

    /** Paints one frame without starting the loop. */
    renderOnce(): void {
        this.#draw();
    }

    /** Starts ticking on the first subscriber; returns an unsubscribe function. */
    subscribe(renderer: CanvasRenderer): () => void {
        this.#renderers.add(renderer);

        if (this.#renderers.size === 1 && !this.#destroyed) {
            // FrameLoop ticks synchronously on subscribe: the renderer is already registered.
            this.#stopLoop = this.#loop.subscribe(() => {
                this.#draw();
            });
        }

        return () => {
            this.#renderers.delete(renderer);

            if (this.#renderers.size === 0) {
                this.#stopLoop?.();
                this.#stopLoop = null;
            }
        };
    }

    /** Releases the observer, the loop and every renderer. Call once on pagehide. */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#resizeObserver?.disconnect();
        this.#stopLoop?.();
        this.#stopLoop = null;
        this.#loop.dispose();
        this.#renderers.clear();
    }

    #draw(): void {
        if (this.#destroyed || this.#size.width <= 0 || this.#size.height <= 0) {
            return;
        }

        const frame: Frame = {
            context: this.context,
            size: this.#size,
            time: this.#time,
            delta: this.#delta,
            frame: this.#frame,
        };

        for (const renderer of this.#renderers) {
            renderer(frame);
        }
    }
}
