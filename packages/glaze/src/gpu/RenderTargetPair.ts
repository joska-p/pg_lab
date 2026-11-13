import { RenderTarget } from './RenderTarget';
import type { RenderTargetOptions } from './RenderTarget';

/** Called once, when the pair is destroyed — lets an owner stop tracking it. */
export type RenderTargetPairDestroyHook = (pair: RenderTargetPair) => void;

/**
 * A ping-pong pair of `RenderTarget`s. On each pass, the consumer reads from `.read` and writes to
 * `.write`; then calls `swap()` so the roles flip for the next pass.
 *
 * Both targets share the same size and filter options.
 */
export class RenderTargetPair {
    readonly #a: RenderTarget;
    readonly #b: RenderTarget;
    readonly #onDestroy: RenderTargetPairDestroyHook | undefined;
    #pingPong = 0; // 0 → a=read, b=write; 1 → b=read, a=write
    #destroyed = false;

    constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        options?: RenderTargetOptions,
        onDestroy?: RenderTargetPairDestroyHook,
    ) {
        // The pair owns its targets; they must not notify an external owner when destroyed
        // internally — the pair's own destroy hook covers that.
        this.#a = new RenderTarget(gl, width, height, options);
        this.#b = new RenderTarget(gl, width, height, options);
        this.#onDestroy = onDestroy;
    }

    get read(): RenderTarget {
        return this.#pingPong === 0 ? this.#a : this.#b;
    }

    get write(): RenderTarget {
        return this.#pingPong === 0 ? this.#b : this.#a;
    }

    get width(): number {
        return this.#a.width;
    }

    get height(): number {
        return this.#a.height;
    }

    /** Exchanges the read and write roles. */
    swap(): void {
        this.#pingPong = 1 - this.#pingPong;
    }

    /** Resizes both targets. No-op when dimensions are unchanged. */
    resize(width: number, height: number): void {
        this.#a.resize(width, height);
        this.#b.resize(width, height);
        this.#pingPong = 0;
    }

    /** Recreates both targets at the current size — the context-restore path. */
    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#a.reinitialize();
        this.#b.reinitialize();
        this.#pingPong = 0;
    }

    /** Clears both targets (r, g, b, a in [0, 1]). */
    clear(r = 0, g = 0, b = 0, a = 0): void {
        if (this.#destroyed) {
            return;
        }

        this.#a.clear(r, g, b, a);
        this.#b.clear(r, g, b, a);
    }

    /** Idempotent: destroys both targets and notifies the owner exactly once. */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#a.destroy();
        this.#b.destroy();
        this.#onDestroy?.(this);
    }
}

export function createRenderTargetPair(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    options?: RenderTargetOptions,
    onDestroy?: RenderTargetPairDestroyHook,
): RenderTargetPair {
    return new RenderTargetPair(gl, width, height, options, onDestroy);
}
