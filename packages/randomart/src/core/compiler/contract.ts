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
