import { assertFinite } from '../../shared/shared';
import type { Brand } from '../../shared/shared';

/** WebGL context flags for the randomart context. */
export const DEFAULT_CONTEXT_OPTIONS: WebGLContextAttributes = {
    antialias: false,
    preserveDrawingBuffer: true,
};

/**
 * Normalized loop phase in [0, 1). Brand guarantees wrapping: only `createPhase` produces a
 * `Phase`, so nothing can inject 0.999… or stale 1.0 into `RenderKey` or `u_phase`.
 *
 * `Phase` brand is randomart-owned; glaze has none, its `Clock.progress` is raw [0, 1].
 */
export type Phase = Brand<number, 'Phase'>;

/** Normalizes clock progress [0, 1] → loop phase [0, 1): wraps out-of-range, folds 1.0 to 0. */
export function createPhase(progress: number): Phase {
    // Precondition: finite progress; prevents NaN in uniforms.
    assertFinite(progress, 'clock progress');

    const wrapped = ((progress % 1) + 1) % 1;
    // Guard against FP rounding where wrapped might be 1.
    return (wrapped >= 1 ? 0 : wrapped) as Phase;
}
