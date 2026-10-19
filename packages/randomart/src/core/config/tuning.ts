import type { ParamRange } from '../catalog/index.ts';
import type { ColorSpaceId } from '../color/index.ts';
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
    readonly allowsAnchors: boolean;
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
 * with the same grammar AND the same draw-affecting values. Changing anything under `terminals` or
 * `generator` alters the numbers every seed produces → **bump `GENERATOR_VERSION` and regenerate
 * the generator snapshots**. Changing `recipe` or `sampling` alters which recipes and seeds the
 * sampler explores, but not what `generate()` draws for a given `(grammar, seed)`. `color` changes
 * the rendered image without changing the expression (a shader change, not a generator one);
 * `artwork` and `app` are shell/render policy and affect no PRNG stream. The pinning tests in
 * `tuning.test.ts` fail on any change, as the reminder.
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
    /** Drawn operator params (generator/generator.ts). Draw-affecting. */
    readonly generator: {
        /**
         * Decimal places every drawn param is rounded to. Rounding is part of the draw: changing it
         * changes the expression a seed produces (see the `GENERATOR_VERSION` note above).
         */
        readonly paramDecimals: number;
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
    /** Sampling policy shared by the app and the dataset. Sampler-affecting. */
    readonly sampling: {
        /** Base seed of every deterministic sample draw. */
        readonly baseSeed: number;
        /**
         * Weight spread of one exploration step (the UI shuffle): each live weight is multiplied by
         * a log-uniform factor in `[1/exploreSpread, exploreSpread]`.
         */
        readonly exploreSpread: number;
        /**
         * Weight spread of a full random draw (dataset, `randomGrammar`): deliberately wider than a
         * UI step so the sample covers more of the space.
         */
        readonly drawSpread: number;
        /** Probability that each operator toggles on/off in one exploration step. */
        readonly changeRate: number;
        /** Seeds per grammar in the bench's contact sheet (a 6×6 deck). */
        readonly benchSeedsPerGrammar: number;
        /** Seeds per grammar in the offline dataset (a 4×4 deck). */
        readonly datasetSeedsPerGrammar: number;
    };
    /**
     * Artwork/render defaults (core/artwork/types.ts). Shell-level taste: the values a new artwork
     * carries when the caller says nothing. The render bounds stay guards, next to the artwork
     * brand.
     */
    readonly artwork: {
        readonly defaultWidth: number;
        readonly defaultHeight: number;
        readonly defaultLoopMs: number;
    };
    /**
     * How the raw triplet becomes colour (core/color/index.ts). Not draw-affecting: the expression
     * is unchanged, the shader's output is.
     */
    readonly color: {
        /**
         * OKLab chroma at `|g| = 1`, used by the OKLCH and OKLab spaces. 0.4 exceeds the sRGB gamut
         * at most lightnesses, so the final clamp does real per-channel work.
         */
        readonly oklabChroma: number;
    };
    /**
     * The app's curated defaults (core/color/index.ts, grammar/presets.ts). The colour space and
     * trunk depth appear in both `DEFAULT_CHANNELS` and the `Structure` preset, so they live here
     * once.
     */
    readonly channels: {
        readonly defaultSpace: ColorSpaceId;
        readonly defaultShareDepth: number;
    };
    /** App shell (stores/appStore.ts). Not draw-affecting. */
    readonly app: {
        /** Maximum number of entries kept in the exploration history. */
        readonly historyLimit: number;
        /** Seed of the initial artwork, so the first screen is reproducible. */
        readonly initialSeed: number;
    };
}

export const TUNING = {
    terminals: {
        amp: { min: 0, max: 0.7 },
        phase: { min: -1, max: 1 },
        cycles: { min: 0, max: 1 },
        cycleCounts: { min: 1, max: 3 },
    },
    generator: {
        paramDecimals: 3,
    },
    recipe: {
        levels: {
            off: { weight: 0, odds: 3, allowsAnchors: false },
            low: { weight: 0.5, odds: 2, allowsAnchors: false },
            normal: { weight: 1, odds: 3, allowsAnchors: true },
            high: { weight: 3, odds: 2, allowsAnchors: true },
        },
        minActiveFamilies: 2,
        sizeProfiles: {
            small: { minDepth: 2, maxDepth: 5, maxNodes: 30 },
            medium: { minDepth: 3, maxDepth: 8, maxNodes: 60 },
            large: { minDepth: 4, maxDepth: 10, maxNodes: 120 },
        },
    },
    sampling: {
        baseSeed: 1,
        exploreSpread: 4,
        drawSpread: 8,
        changeRate: 0.3,
        benchSeedsPerGrammar: 36,
        datasetSeedsPerGrammar: 16,
    },
    artwork: {
        defaultWidth: 1_024,
        defaultHeight: 1_024,
        defaultLoopMs: 8_000,
    },
    color: {
        oklabChroma: 0.4,
    },
    channels: {
        defaultSpace: 'oklch',
        defaultShareDepth: 2,
    },
    app: {
        historyLimit: 30,
        initialSeed: 42,
    },
} as const satisfies Tuning;

/** Ids of the weight axis, in draw order. */
export type WeightLevel = keyof typeof TUNING.recipe.levels;

/** Ids of the size axis, in draw order. */
export type SizeProfileId = keyof typeof TUNING.recipe.sizeProfiles;
