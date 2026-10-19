import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { CONFIG } from '../core/config/index.ts';
import { assertFinite } from '../core/shared/index.ts';
import type { Brand } from '../core/shared/index.ts';

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
 * Normalized loop phase in [0, 1). The brand carries the wrapping guarantee: `createPhase` is the
 * only way to a `Phase`, so nothing outside can inject 0.9999… or a stale 1.0 into `RenderKey` or
 * the `u_phase` uniform.
 *
 * The `Phase` brand literal is owned by randomart: glaze has no phase brand, and its
 * `Clock.progress` stays a raw number over [0, 1] inclusive.
 */
export type Phase = Brand<number, 'Phase'>;

/**
 * Normalizes the clock progress [0, 1] into the loop phase [0, 1): wraps out-of-range values
 * (negative, > 1) and folds the inclusive 1.0 boundary back to 0.
 */
export function createPhase(progress: number): Phase {
    // `Clock.progress` is finite by construction (seconds over a strictly positive duration —
    // glaze `createDurationSeconds`). The assert documents that precondition rather than letting a
    // NaN propagate into the uniforms and the render gate.
    assertFinite(progress, 'clock progress');

    const wrapped = ((progress % 1) + 1) % 1;
    // Guard against floating point rounding edge cases where wrapped might evaluate to 1.
    return (wrapped >= 1 ? 0 : wrapped) as Phase;
}

/**
 * Handwritten test fragment shader proving the GPU pipeline and coordinate conventions. Gradient:
 *
 * - Red channel: v_p.x mapped from [-1, 1] to [0, 1] (black on left, red on right)
 * - Green channel: v_p.y mapped from [-1, 1] to [0, 1] (black on bottom, green on top, y points up)
 * - Blue channel: oscillating wave based on u_phase
 */
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
