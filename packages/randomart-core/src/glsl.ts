/** Seconds of `iTime` per unit of the continuous `u_phase` time. */
export const TIME_SCALE_SECONDS = 60;

/**
 * Shadertoy prelude shared with the renderer: the host provides `iResolution`, `iTime` and
 * `fragCoord`, then calls `mainImage(fragColor, fragCoord)`.
 */
export const SHADER_HEADER = `const float PI = 3.141592653589793;`;

/**
 * GLSL float literal. Integers gain a decimal point so they are not typed as `int`; `-0` is
 * normalised to `0.0`.
 */
export function glslFloat(value: number): string {
    const text = String(value === 0 ? 0 : value);
    return text.includes('.') || /[eE]/.test(text) ? text : `${text}.0`;
}

/**
 * Single time hook. `u_phase` is a continuous, non-looping time in units of `TIME_SCALE_SECONDS`;
 * operators keep reading the local `u_phase`. Changing the animation model starts with this
 * function.
 */
export const GLSL_TIME_HOOK = `// Single time hook. Change this function to alter the animation model.
float ra_phase() {
    return iTime / ${glslFloat(TIME_SCALE_SECONDS)};
}`;

/** Helper functions referenced by operators through `OpDef.requires`. */
export const GLSL_FUNCTIONS = {
    ra_fold2: `vec2 ra_fold2(vec2 v) {
    return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0;
}`,
    // A dedicated function keeps `sqr` reading its input once, so the DAG usage count stays exact.
    ra_sqr: `float ra_sqr(float value) {
    return value * value;
}`,
    ra_smin: `float ra_smin(float a, float b, float k) {
    float h = clamp(0.5 - 0.5 * (a - b) / k, 0.0, 1.0);
    return clamp(mix(b, a, h) - k * h * (1.0 - h), -1.0, 1.0);
}`,
    // Smooth max is the negation twin of smooth min: `h` compares `a` against `b` (`a - b`), not
    // `b` against `a`. Flipping that term silently turns the operator back into a smooth min.
    ra_smax: `float ra_smax(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
    return clamp(mix(b, a, h) + k * h * (1.0 - h), -1.0, 1.0);
}`,
} as const;

export type GlslFunctionId = keyof typeof GLSL_FUNCTIONS;
