import { Camera2D } from '@repo/surface/core/Camera2D';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

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

const DEFAULT_PARAMS: FractalParams = {
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
    juliaRe: -0.8,
    juliaIm: 0.156,
};

export type ParamKey = keyof FractalParams;

const store = createStore<FractalParams>(() => ({ ...DEFAULT_PARAMS }));

export function useParams(): FractalParams {
    return useStore(store);
}

export function setParam(key: ParamKey, value: number): void {
    store.setState({ [key]: value } as Partial<FractalParams>);
}

/** Naive float32 pipeline: the honest camera ceiling for f32-only arithmetic (D10). */
const MAX_ZOOM = 1e6;

/** Module-owned camera (D4): live reactive Camera2D without brands. */
export const camera = new Camera2D({ maxZoom: MAX_ZOOM });
