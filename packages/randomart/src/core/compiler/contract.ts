/**
 * The GLSL contract the compiler guarantees for every fragment shader it emits: `vUv` as the UV
 * input, `v_p` as the centered coordinates initialized at the start of `main`, and `o_color` as the
 * final color output. The renderer provides the vertex stage and the context; it consumes this
 * shape rather than owning it (§2.4: core is the source of the shader, the renderer plumb it).
 */

/** Contract snippet: vertex-to-fragment UV coordinate input. */
export const GLSL_IN_UV = 'in vec2 vUv;';

/** Contract snippet: final fragment color output. */
export const GLSL_OUT_COLOR = 'out vec4 o_color;';

/**
 * Contract snippet: conversion of `vUv` [0, 1]² to centered coordinates `v_p` [-1, 1]² ensuring y
 * points upwards.
 *
 * Image conventions: x grows right, y grows up; [-1, 1]² is stretched over the whole image whatever
 * its shape; color values are written as-is and read as sRGB, no linear conversion.
 */
export const GLSL_COORD_INIT = 'vec2 v_p = vUv * 2.0 - 1.0;';

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
