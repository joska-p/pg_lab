import type { ParamRange, ColorSpaceId, SizeProfiles, SizeProfileId } from './types';

/**
 * Package curated values — single source of truth for quantized axes. Edit + HMR, no code change.
 *
 * One value, one name: consumers read `CONFIG.<section>.<key>`; no re-declaration. Derived models
 * (e.g., `constraintsOf`) are composition, not renaming. Keys are bare (no `default` prefix).
 *
 * Guards (hard limits) live next to the invariants they protect, not here — they're not for tuning.
 *
 * PRNG sensitivity: a seed reproduces an image only with same grammar AND draw-affecting values.
 * Changing `terminals`, `generator`, or an existing `sizeProfiles` entry → bump `GENERATOR_VERSION`
 * (`core/generator/generator.ts`) and regenerate the `generator.test.ts` snapshots, which fail on
 * any such change. Changing `grammar`/`sampling` alters sampler exploration, not `generate()`
 * output for a fixed grammar. `artwork`/`channels`/`app` change the default image, not the
 * expression.
 */
interface Config {
    /** Time terminals `x`/`y`. Draw-affecting. */
    readonly terminals: {
        /** Oscillator amplitude. At most 0.7 to avoid constant-in-space flattening. */
        readonly amp: ParamRange;
        /** Oscillator phase, drawn as share of [-1, 1], emitted as `PI * phase`. */
        readonly phase: ParamRange;
        /** Cycle-count share in [0, 1], mapped to whole cycles per loop via `cycleCounts`. */
        readonly cycles: ParamRange;
    };
    /** Drawn operator params. Draw-affecting. */
    readonly generator: {
        /**
         * Decimal places for drawn params. Rounding is part of the draw; changing it bumps
         * GENERATOR_VERSION.
         */
        readonly paramDecimals: number;
    };
    /** Quantized grammar space. Sampler-affecting. */
    readonly grammar: {
        /** Weight axis finesse: every operator weight is an integer in `[0, maxWeight]`. */
        readonly maxWeight: number;
        /** Size axis: one depth/node budget per profile; constraints derived from it. */
        readonly sizeProfiles: SizeProfiles;
    };
    /** Sampling policy (app + dataset). Sampler-affecting. */
    readonly sampling: {
        /** Base seed for deterministic sample draws. */
        readonly baseSeed: number;
        /** Probability an operator moves one notch per walk step. 0 = freeze; 1 = always move. */
        readonly changeRate: number;
        /** Seeds per grammar in bench contact sheet (6×6). */
        readonly benchSeedsPerGrammar: number;
        /** Seeds per grammar in offline dataset (4×4). */
        readonly datasetSeedsPerGrammar: number;
    };
    /** Artwork/render defaults. Render bounds are guards next to the artwork brand. */
    readonly artwork: {
        readonly width: number;
        readonly height: number;
        readonly loopMs: number;
    };
    /** App curated defaults (color space + trunk depth), shared with presets. */
    readonly channels: {
        readonly space: ColorSpaceId;
        readonly shareDepth: number;
    };
    /** Lab workspace bounds. Not draw-affecting. */
    readonly app: {
        /** Max entries in exploration history. */
        readonly historyLimit: number;
        /** Initial artwork seed for reproducible first screen. */
        readonly initialSeed: number;
    };
}

export const CONFIG = {
    terminals: {
        amp: { min: 0, max: 0.7 },
        phase: { min: -1, max: 1 },
        cycles: { min: 1, max: 3, step: 1 },
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
    channels: {
        space: 'oklch',
        shareDepth: 2,
    },
    app: {
        historyLimit: 30,
        initialSeed: 42,
    },
} as const satisfies Config;

/** Guard for the size registry: a profile id is content, an unknown one has no canonical repair. */
export function isSizeProfileId(value: unknown): value is SizeProfileId {
    return typeof value === 'string' && Object.hasOwn(CONFIG.grammar.sizeProfiles, value);
}
