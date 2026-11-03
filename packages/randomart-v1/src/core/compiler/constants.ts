/** Hard upper bound on emitted GLSL source length (see `SharingPolicy`). */
export const MAX_SOURCE_LENGTH = 200_000;

/* -------------------------------------------------------------------------- */
/* GLSL renderer contract                                                      */
/* -------------------------------------------------------------------------- */

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

/** Name of the root coordinate context in the lowered DAG. */
export const ROOT_CTX = 'root';
