import type { GpuSurface } from '@repo/glaze/gpu/types';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { createCameraRig } from '../../core/observedCamera';

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

// The glaze surface is a live object owned by GpuCanvas (conventions §3.2): the store only
// provides reachability, so the perturbation experiment can attach its `webglcontextrestored`
// handler the moment the surface materializes. Dereferenced on unmount.
interface SurfaceState {
    surface: GpuSurface | null;
}

const surfaceStore = createStore<SurfaceState>(() => ({ surface: null }));

export function usePerturbationSurface(): GpuSurface | null {
    return useStore(surfaceStore, (state) => state.surface);
}

export function setPerturbationSurface(surface: GpuSurface | null): void {
    surfaceStore.setState({ surface });
}

/** Perturbation (reference orbit + double-single): the deepest honest tier, up to 1e15 (D10). */
export const MAX_ZOOM = 1e15;

/** Module-owned camera rig (D4): the glaze camera is the truth, the rig owns its change signal. */
export const cameraRig = createCameraRig({ maxZoom: MAX_ZOOM });
