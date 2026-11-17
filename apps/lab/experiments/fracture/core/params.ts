/**
 * Numeric state shared by the five pipelines. The React version kept one Zustand store per module;
 * the static page keeps one plain object per experiment instead. Every field is a number, so a
 * single key type covers the shared iteration/lighting/colour controls and the Julia-only pair.
 */
export interface FractalParams {
    iterationBase: number;
    iterationScale: number;
    iterationCap: number;
    interiorScale: number;
    pixelEps: number;
    sunAngle: number;
    bumpHeight: number;
    ambientLight: number;
    hueShift: number;
    hueFrequency: number;
    chromaScale: number;
    juliaRe: number;
    juliaIm: number;
}

export const DEFAULT_PARAMS: FractalParams = {
    iterationBase: 70,
    iterationScale: 30,
    iterationCap: 1200,
    interiorScale: 9.0,
    pixelEps: 0.0025,
    sunAngle: 2.35,
    bumpHeight: 15.0,
    ambientLight: 0.2,
    hueShift: 0.0,
    hueFrequency: 0.1,
    chromaScale: 0.05,
    // Only read by the Julia bodies; harmless (and unused) in Mandelbrot pipelines.
    juliaRe: -0.8,
    juliaIm: 0.156,
};

export type ParamKey = keyof FractalParams;

export function createParams(): FractalParams {
    return { ...DEFAULT_PARAMS };
}
