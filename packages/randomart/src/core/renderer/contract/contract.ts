import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { CONFIG } from '../../config/config';
import { assertFinite } from '../../shared/shared';
import type { Brand } from '../../shared/shared';

/** Default loop duration in seconds, derived from `CONFIG.artwork.loopMs`. */
export const DEFAULT_LOOP_DURATION: DurationSeconds = createDurationSeconds(
    CONFIG.artwork.loopMs / 1000,
);

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

/** Test shader verifying GPU pipeline + coordinate conventions (gradient + phase animation). */
export const HANDWRITTEN_TEST_SHADER = /* glsl */ `
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform float u_phase;

const float TWO_PI = 6.283185307179586;

void main() {
    vec2 v_p = vUv * 2.0 - 1.0;

    float r = v_p.x * 0.5 + 0.5;
    float g = v_p.y * 0.5 + 0.5;
    float b = 0.5 + 0.5 * sin(u_phase * TWO_PI);

    o_color = vec4(r, g, b, 1.0);
}
`.trim();
