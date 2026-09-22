import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { createParamStore, DEFAULT_PARAMS } from './paramStore';

export const mandelbrotStore = createParamStore(DEFAULT_PARAMS);

/**
 * Precision is an axis inside the experiment, not a separate experiment (SPEC vision): it selects
 * the fragment shader + uniform provider while sharing one camera (D1, D2).
 */
export type MandelbrotPrecision = 'naive' | 'double-split';

interface PrecisionState {
    precision: MandelbrotPrecision;
}

const precisionStore = createStore<PrecisionState>(() => ({ precision: 'naive' }));

export function useMandelbrotPrecision(): MandelbrotPrecision {
    return useStore(precisionStore, (state) => state.precision);
}

export function setMandelbrotPrecision(precision: MandelbrotPrecision): void {
    precisionStore.setState({ precision });
}
