import { assertFinite } from '../../shared/shared';
import type { Phase } from '../types';

/** Normalizes clock progress [0, 1] → loop phase [0, 1): wraps out-of-range, folds 1.0 to 0. */
export function createPhase(progress: number): Phase {
    // Precondition: finite progress; prevents NaN in uniforms.
    assertFinite(progress, 'clock progress');

    const wrapped = ((progress % 1) + 1) % 1;
    // Guard against FP rounding where wrapped might be 1.
    return (wrapped >= 1 ? 0 : wrapped) as Phase;
}
