/**
 * Size contract shared by the CPU and GPU backends.
 *
 * `width`/`height` are CSS pixels (layout and pointer space) while `deviceWidth`/`deviceHeight` are
 * physical pixels (the canvas backing store). The device size is `round(css * dpr)` so a fractional
 * layout never produces a fractional buffer — which browsers round on their own, in a way that
 * would make the transform disagree with the buffer.
 */
export interface CanvasSize {
    width: number;
    height: number;
    deviceWidth: number;
    deviceHeight: number;
    dpr: number;
}

/**
 * Resolves the pixel ratio: an explicit value always wins, otherwise `window.devicePixelRatio` is
 * read, with an SSR-safe fallback of 1.
 */
export function resolveDpr(dpr?: number): number {
    if (dpr !== undefined) {
        return dpr;
    }

    return typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
}

/** Measures the canvas in CSS pixels and derives its physical size for the given (or detected) DPR. */
export function measureCanvas(canvas: HTMLCanvasElement, dpr?: number): CanvasSize {
    const resolvedDpr = resolveDpr(dpr);
    const rect =
        typeof canvas.getBoundingClientRect === 'function'
            ? canvas.getBoundingClientRect()
            : { width: canvas.clientWidth ?? 0, height: canvas.clientHeight ?? 0 };
    const width = rect.width;
    const height = rect.height;

    return {
        width,
        height,
        deviceWidth: Math.round(width * resolvedDpr),
        deviceHeight: Math.round(height * resolvedDpr),
        dpr: resolvedDpr,
    };
}

/**
 * Applies the physical size to the canvas backing store. Assigning `canvas.width`/`height` resets
 * the context state, so it is only done when the size actually changes — callers must re-apply
 * their transform afterwards.
 */
export function applyCanvasSize(canvas: HTMLCanvasElement, size: CanvasSize): void {
    if (canvas.width !== size.deviceWidth) {
        canvas.width = size.deviceWidth;
    }

    if (canvas.height !== size.deviceHeight) {
        canvas.height = size.deviceHeight;
    }
}
