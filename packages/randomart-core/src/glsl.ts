/** Duration in seconds of one `ra_phase()` cycle. The UI maps its own loop duration with `iTime`. */
export const PHASE_PERIOD_SECONDS = 60;

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
 * Single time hook. `iTime` is converted to a normalised phase here so operators can keep reading
 * the local `u_phase`; changing the animation model starts with this function.
 */
export const GLSL_TIME_HOOK = `// Single time hook. Change this function to alter the animation model.
float ra_phase() {
    return fract(iTime / ${glslFloat(PHASE_PERIOD_SECONDS)});
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
} as const;

export type GlslFunctionId = keyof typeof GLSL_FUNCTIONS;
