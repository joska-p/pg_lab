/**
 * GLSL ES 3.00 contract shared with the renderer: a fullscreen fragment shader reading `vUv`
 * (0..1), `u_phase` (0..1) and writing `o_color`.
 */
export const SHADER_HEADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform float u_phase;

const float PI = 3.141592653589793;`;

/** Helper functions referenced by operators through `OpDef.requires`. */
export const GLSL_FUNCTIONS = {
    ra_fold2: `vec2 ra_fold2(vec2 v) {
    return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0;
}`,
    // A dedicated function keeps `sqr` reading its input once, so the DAG usage count stays exact.
    ra_sqr: `float ra_sqr(float value) {
    return value * value;
}`,
} as const;

export type GlslFunctionId = keyof typeof GLSL_FUNCTIONS;

/**
 * GLSL float literal. Integers gain a decimal point so they are not typed as `int`; `-0` is
 * normalised to `0.0`.
 */
export function glslFloat(value: number): string {
    const text = String(value === 0 ? 0 : value);
    return text.includes('.') || /[eE]/.test(text) ? text : `${text}.0`;
}
