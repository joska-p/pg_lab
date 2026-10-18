/**
 * Motion.ts — the time domain, expressed on the coordinates rather than as vocabulary operators.
 *
 * Historically animation came from two catalog terminals (`tsin`/`tcos`) spliced into an
 * expression: they were a single value everywhere on the image, flattened whole subtrees at phase
 * 0, and only appeared when a grammar happened to draw them. Motion replaces that with a prelude on
 * `v_p` — the sampling coordinates every expression ultimately reads through `x`/`y` — so the whole
 * image moves coherently and the play button is meaningful for every artwork.
 *
 * The invariants that make this safe:
 *
 * - **Phase 0 is the still image.** Every motion vanishes at `u_phase = 0` (a `sin(2π·0) = 0`
 *   perturbation, an identity rotation, a unit scale), so the dataset, bench and thumbnails — all
 *   rendered at phase 0 — are byte-identical to a static grammar. There is no "animated" special
 *   case to exclude from the dataset.
 * - **Exactly periodic in `u_phase`.** Every motion is built from `sin(2π·φ)`, so any loop duration
 *   wraps cleanly.
 */

/** Every motion the recipe space can name. `off` is the static, phase-0-identity baseline. */
export const MOTION_LEVELS = ['off', 'drift', 'swing', 'pulse'] as const;
export type MotionLevel = (typeof MOTION_LEVELS)[number];

export const DEFAULT_MOTION: MotionLevel = 'off';

/** Content, like a colour space: an unknown motion has no canonical repair and is refused. */
export function isMotionLevel(value: unknown): value is MotionLevel {
    return typeof value === 'string' && (MOTION_LEVELS as readonly string[]).includes(value);
}

/**
 * Amplitude of each moving motion, in coordinate units (drift offset, swing radians in, pulse scale
 * factor). Tuned to read as motion without tearing the image apart; `off` is 0 by construction.
 * Kept as data so the UI can reason about intensity without duplicating the numbers.
 */
export const MOTION_AMPLITUDE: Record<MotionLevel, number> = {
    off: 0,
    drift: 0.35,
    swing: 0.35,
    pulse: 0.3,
};

/** `2π/3`, the phase offset that turns a single sine into a rounded Lissajous drift. */
const LISSAJOUS_OFFSET = '2.0943951';

const PHASE = 'sin(2.0*PI*u_phase)';

/**
 * The GLSL that defines `vec2 v_p` inside `main()`, for the given motion. Lines are indented two
 * spaces to match the surrounding emission. `off` is exactly the historical single line; the moving
 * cases perturb, rotate or scale the base `vUv * 2.0 - 1.0` coordinate by a factor that is 0
 * (identity) at phase 0.
 *
 * `PI` and `u_phase` come from the preamble (renderer contract: `u_phase` is always declared).
 */
export function coordinateLines(motion: MotionLevel): readonly string[] {
    switch (motion) {
        case 'off':
            return ['  vec2 v_p = vUv * 2.0 - 1.0;'];
        case 'drift':
            return [
                '  vec2 v_p = vUv * 2.0 - 1.0;',
                `  v_p += ${MOTION_AMPLITUDE.drift} * vec2(${PHASE}, sin(2.0*PI*u_phase + ${LISSAJOUS_OFFSET}));`,
            ];
        case 'swing':
            return [
                '  vec2 v_p0 = vUv * 2.0 - 1.0;',
                `  float swingA = ${MOTION_AMPLITUDE.swing} * ${PHASE};`,
                '  vec2 v_p = mat2(cos(swingA), -sin(swingA), sin(swingA), cos(swingA)) * v_p0;',
            ];
        case 'pulse':
            return [
                `  vec2 v_p = (vUv * 2.0 - 1.0) * (1.0 + ${MOTION_AMPLITUDE.pulse} * ${PHASE});`,
            ];
    }
}
