import { createDurationSeconds, type DurationSeconds } from '@repo/glaze/core/time';

/** Contract snippet: vertex-to-fragment UV coordinate input. */
export const GLSL_IN_UV = 'in vec2 vUv;';

/** Contract snippet: final fragment color output. */
export const GLSL_OUT_COLOR = 'out vec4 o_color;';

/**
 * Contract snippet: conversion of `vUv` [0, 1]² to centered coordinates `v_p` [-1, 1]² ensuring y
 * points upwards.
 */
export const GLSL_COORD_INIT = 'vec2 v_p = vUv * 2.0 - 1.0;';

/** Default loop duration in seconds (spec: 8000ms). */
export const DEFAULT_LOOP_DURATION: DurationSeconds = createDurationSeconds(8);

/** Default context options for randomart (spec / PLAN friction 4b). */
export const DEFAULT_CONTEXT_OPTIONS: WebGLContextAttributes = {
    antialias: false,
    preserveDrawingBuffer: true,
};

/**
 * Computes the normalized animation phase in [0, 1) from the clock progress. Guarantees strictly
 * [0, 1) even when progress equals 1.0 at loop boundaries or after seek.
 */
export function calculatePhase(progress: number): number {
    const wrapped = ((progress % 1) + 1) % 1;
    // Guard against floating point rounding edge cases where wrapped might evaluate to 1
    return wrapped >= 1 ? 0 : wrapped;
}

/**
 * Validates that a fragment shader adheres to the GLSL contract:
 *
 * - Does NOT contain #version directive (handled by glaze)
 * - Contains input `in vec2 vUv;`
 * - Contains output `out vec4 o_color;`
 * - Initializes `vec2 v_p = vUv * 2.0 - 1.0;`
 */
export function validateShaderContract(source: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (/^\s*#version/m.test(source)) {
        errors.push('Fragment shader must not specify #version (glaze automatically injects it).');
    }
    if (!source.includes(GLSL_IN_UV)) {
        errors.push(`Fragment shader must declare input "${GLSL_IN_UV}".`);
    }
    if (!source.includes(GLSL_OUT_COLOR)) {
        errors.push(`Fragment shader must declare output "${GLSL_OUT_COLOR}".`);
    }
    if (!source.includes(GLSL_COORD_INIT)) {
        errors.push(`Fragment shader must initialize "${GLSL_COORD_INIT}" at beginning of main.`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
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
