import type { ParamRange } from '../catalog/index.ts';
import type { ConstraintsInput } from '../grammar/types.ts';

/** One level of the quantized weight axis: what it means and how often it is drawn. */
export interface WeightLevelKnobs {
    /** Operator weight the level maps to (its meaning on the axis). */
    readonly weight: number;
    /** Relative odds of the level in a random draw: bias the sampler here. */
    readonly odds: number;
    /**
     * Whether anchors (x/y) may be drawn at this level: `off` would let a grammar lose every
     * spatial anchor, hence the restriction to `normal`/`high`.
     */
    readonly anchor: boolean;
}

/**
 * Taste knobs: the numbers we iterate on while exploring the look/feel, in one place instead of
 * scattered through the core. Edit + HMR, no code change. This file is the **single source of
 * truth** for the quantized axes: the level and size ids are `keyof` its entries, so adding a level
 * (`medium-low`, `very-high`, …) is adding an entry here — the compiler then points at every site
 * that must handle it.
 *
 * This is NOT where guards live. Hard limits that keep the system safe (`MAX_DEPTH`,
 * `MAX_SOURCE_LENGTH`, `MAX_RENDER_SIZE`…) stay next to the invariants they protect: they are not
 * meant to be tuned, and putting them here would invite tuning them.
 *
 * PRNG sensitivity (see `GENERATOR_VERSION` in `../generator`): a seed reproduces an image only
 * with the same grammar AND the same draw-affecting values. Changing anything under `terminals`
 * (or, later, the param rounding) alters the numbers every seed produces → **bump
 * `GENERATOR_VERSION` and regenerate the generator snapshots**. Changing `recipe` values alters
 * which recipes and seeds the sampler explores, but not what `generate()` draws for a given
 * `(grammar, seed)`. The pinning tests in `tuning.test.ts` fail on either change, as the reminder.
 */
export interface Tuning {
    /** Time terminals `x`/`y` (catalog/operators/terminals.ts). Draw-affecting. */
    readonly terminals: {
        /**
         * Oscillator amplitude. At most 0.7: a pure oscillator would be constant in space and
         * flatten its subtree.
         */
        readonly amp: ParamRange;
        /** Oscillator phase, drawn as a share of [-1, 1] and emitted as `PI * phase`. */
        readonly phase: ParamRange;
        /**
         * Cycle-count share in [0, 1], mapped to whole cycles per loop through `cycleCounts` (`min +
         * round((max - min) * share)`). Whole cycles keep the loop exactly periodic.
         */
        readonly cycles: ParamRange;
        /** Whole cycles per loop produced by the `cycles` share. */
        readonly cycleCounts: ParamRange;
    };
    /** Quantized recipe space (core/grammar/quantized.ts). Sampler-affecting. */
    readonly recipe: {
        /**
         * The weight axis, one entry per level. **Append, don't reorder**: the entry order is the
         * PRNG draw order of `randomRecipe`, so reordering changes what every recipe seed draws.
         */
        readonly levels: Readonly<Record<string, WeightLevelKnobs>>;
        /**
         * At least this many non-anchor families stay on: a bare x/y vocabulary only draws
         * gradients.
         */
        readonly minActiveFamilies: number;
        /** The size axis, one entry per profile. Same append-only note as `levels`. */
        readonly sizeProfiles: Readonly<Record<string, ConstraintsInput>>;
    };
}

export const TUNING = {
    terminals: {
        amp: { min: 0, max: 0.7 },
        phase: { min: -1, max: 1 },
        cycles: { min: 0, max: 1 },
        cycleCounts: { min: 1, max: 3 },
    },
    recipe: {
        levels: {
            off: { weight: 0, odds: 3, anchor: false },
            low: { weight: 0.5, odds: 2, anchor: false },
            normal: { weight: 1, odds: 3, anchor: true },
            high: { weight: 3, odds: 2, anchor: true },
        },
        minActiveFamilies: 2,
        sizeProfiles: {
            small: { minDepth: 2, maxDepth: 5, maxNodes: 30 },
            medium: { minDepth: 3, maxDepth: 8, maxNodes: 60 },
            large: { minDepth: 4, maxDepth: 10, maxNodes: 120 },
        },
    },
} as const satisfies Tuning;

/** Ids of the weight axis, in draw order. */
export type WeightLevel = keyof typeof TUNING.recipe.levels;

/** Ids of the size axis, in draw order. */
export type SizeProfileId = keyof typeof TUNING.recipe.sizeProfiles;
