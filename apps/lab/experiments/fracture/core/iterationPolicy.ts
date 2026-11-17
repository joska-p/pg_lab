// Must mirror the loop-count formula in the Mandelbrot GLSL so CPU and shader never disagree.
export function computeMaxIterations(
    zoom: number,
    iterationBase: number,
    iterationScale: number,
    iterationCap: number,
): number {
    const n = iterationBase + Math.log2(Math.max(1, zoom)) * 1.44269504089 * iterationScale;

    return Math.min(Math.floor(n), iterationCap);
}
