import type { ParamRange, ColorSpaceId, Constraints } from './types';

/**
 * The curated values of the package, in one typed module: every number a caller never passes and
 * every value the app starts from. Edit + HMR, no code change.
 *
 * This file is the **single source of truth of the quantized axes**: the weight range and the size
 * ids come from its `grammar` section, so adding a profile (`xx-large`, …) is adding an entry here
 * — the compiler then points at every site that must handle it.
 *
 * **One value, one name.** A consumer reads `CONFIG.<section>.<key>`; it does not re-declare the
 * value under a second name. A domain may _derive_ a model from these values (`DEFAULT_CHANNELS`,
 * `constraintsOf`, `DEFAULT_LOOP_DURATION`), which is composition, not renaming. The `default`
 * prefix is redundant on the keys themselves: a value hardcoded here is, by construction, the
 * default of its section — so the keys are bare (`artwork.width`, `channels.space`).
 *
 * This is NOT where guards live. Hard limits that keep the system safe (`MAX_SOURCE_LENGTH`,
 * `MAX_RENDER_SIZE`, `MAX_ARTWORK_FILE_LENGTH`…) stay next to the invariants they protect: they are
 * not meant to be tuned, and putting them here would invite tuning them. A `types.ts` may carry the
 * guards of its concept; it must never carry a config value or an alias of one.
 *
 * PRNG sensitivity (see `GENERATOR_VERSION` in `../generator`): a seed reproduces an image only
 * with the same grammar AND the same draw-affecting values. Changing anything under `terminals` or
 * `generator` alters the numbers every seed produces → **bump `GENERATOR_VERSION` and regenerate
 * the generator snapshots**. Changing `grammar` (the weight range, the set of profiles) or
 * `sampling` alters which grammars and seeds the sampler explores, but not what `generate()` draws
 * for a grammar whose fields are unchanged. Editing an existing `sizeProfiles` entry is the
 * exception: it changes the constraints of grammars already using that profile, so treat it as
 * draw-affecting. `color` changes the rendered image without changing the expression (a shader
 * change, not a generator one); `artwork` and `app` are shell/render policy and affect no PRNG
 * stream. The pinning tests in `config.test.ts` fail on any change, as the reminder.
 */
interface Config {
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
    /** Quantized grammar space (core/grammar/quantized.ts). Sampler-affecting. */
    readonly grammar: {
        /**
         * Finesse of the weight axis: every operator weight is an integer in `[0, maxWeight]`, with
         * the same range for every operator.
         */
        readonly maxWeight: number;
        /**
         * Size axis: one coherent depth/node budget per profile. A profile is a named point on the
         * axis; constraints are always derived from it, never stored free-form in a grammar.
         */
        readonly sizeProfiles: Readonly<Record<string, Constraints>>;
    };
    /** Sampling policy shared by the app and the dataset. Sampler-affecting. */
    readonly sampling: {
        /** Base seed of every deterministic sample draw. */
        readonly baseSeed: number;
        /**
         * Probability that one operator moves one notch in a walk step (`stepGrammar`). 0 = the
         * walk freezes; 1 = every operator moves at every step.
         */
        readonly changeRate: number;
        /** Seeds per grammar in the bench's contact sheet (a 6×6 deck). */
        readonly benchSeedsPerGrammar: number;
        /** Seeds per grammar in the offline dataset (a 4×4 deck). */
        readonly datasetSeedsPerGrammar: number;
    };
    /**
     * Artwork/render defaults (core/artwork). Shell-level curation: the values a new artwork
     * carries when the caller says nothing. The render bounds stay guards, next to the artwork
     * brand.
     */
    readonly artwork: {
        readonly width: number;
        readonly height: number;
        readonly loopMs: number;
    };
    /**
     * How the raw triplet becomes color (core/color/index.ts). Not draw-affecting: the expression
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
     * The app's curated defaults (core/color/index.ts, grammar/presets.ts). The color space and
     * trunk depth appear in both `DEFAULT_CHANNELS` and the `Structure` preset, so they live here
     * once.
     */
    readonly channels: {
        readonly space: ColorSpaceId;
        readonly shareDepth: number;
    };
    /** App shell (stores/appStore.ts). Not draw-affecting. */
    readonly app: {
        /** Maximum number of entries kept in the exploration history. */
        readonly historyLimit: number;
        /** Seed of the initial artwork, so the first screen is reproducible. */
        readonly initialSeed: number;
    };
}

export const CONFIG = {
    terminals: {
        amp: { min: 0, max: 0.7 },
        phase: { min: -1, max: 1 },
        cycles: { min: 0, max: 1 },
        cycleCounts: { min: 1, max: 3 },
    },
    generator: {
        paramDecimals: 3,
    },
    grammar: {
        maxWeight: 4,
        sizeProfiles: {
            small: { minDepth: 2, maxDepth: 5, maxNodes: 30 },
            medium: { minDepth: 3, maxDepth: 8, maxNodes: 60 },
            large: { minDepth: 4, maxDepth: 10, maxNodes: 120 },
        },
    },
    sampling: {
        baseSeed: 1,
        changeRate: 0.3,
        benchSeedsPerGrammar: 36,
        datasetSeedsPerGrammar: 16,
    },
    artwork: {
        width: 1_024,
        height: 1_024,
        loopMs: 60_000,
    },
    color: {
        oklabChroma: 0.4,
    },
    channels: {
        space: 'oklch',
        shareDepth: 2,
    },
    app: {
        historyLimit: 30,
        initialSeed: 42,
    },
} as const satisfies Config;

/** Ids of the size axis, in draw order. */
export type SizeProfileId = keyof typeof CONFIG.grammar.sizeProfiles;

/** Guard for the size registry: a profile id is content, an unknown one has no canonical repair. */
export function isSizeProfileId(value: unknown): value is SizeProfileId {
    return typeof value === 'string' && Object.hasOwn(CONFIG.grammar.sizeProfiles, value);
}
