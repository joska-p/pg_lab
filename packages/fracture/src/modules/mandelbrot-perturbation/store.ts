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
};

export type ParamKey = keyof FractalParams;

const store = createStore<FractalParams>(() => ({ ...DEFAULT_PARAMS }));

export function useParams(): FractalParams {
    return useStore(store);
}

export function setParam(key: ParamKey, value: number): void {
    store.setState({ [key]: value } as Partial<FractalParams>);
}

/** Perturbation (reference orbit + double-single): the deepest honest tier, up to 1e15 (D10). */
export const MAX_ZOOM = 1e15;

/** Module-owned camera (D4): live reactive Camera2D without brands. */
export const camera = new Camera2D({ maxZoom: MAX_ZOOM });
