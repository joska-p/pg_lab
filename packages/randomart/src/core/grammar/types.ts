import type { OperatorId } from '../catalog/index.ts';
import type { ColorSpaceId } from '../color/index.ts';
import type { SizeProfileId } from '../config/index.ts';
import type { Brand } from '../shared/index.ts';

/**
 * Depth/node budget of a grammar. Constraints are not stored free-form: they are derived from the
 * grammar's `size` profile (`constraintsOf`), so no combination can be infeasible and there is
 * nothing to repair.
 */
export interface Constraints {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

/**
 * Weights keyed by operator id, so the static registry makes a mistyped name a compile error.
 * Partial: an absent operator is simply off — a weight of 0 means the same thing. Values are
 * integers in `[0, CONFIG.grammar.maxWeight]`; validation lives in `createGrammar`.
 */
type GrammarWeights = Readonly<Partial<Record<OperatorId, number>>>;

/**
 * A point of the quantized grammar space: one integer weight per operator, a size profile, a
 * shared-trunk depth and a color space. Everything is discrete by construction — there is no
 * continuous grammar behind it.
 */
export type Grammar = Brand<
    {
        readonly weights: GrammarWeights;
        readonly size: SizeProfileId;
        /**
         * Depth of the trunk the three channels share. `0` = independent trees; `>= maxDepth` = one
         * tree, so `r = g = b`. `createGrammar` clamps it into `[0, maxDepth]` of `size`.
         */
        readonly shareDepth: number;
        readonly space: ColorSpaceId;
    },
    'Grammar'
>;

/** Indicator only, not a rule: lets the UI hint at the "character" of a grammar. */
export interface GrammarSummary {
    /** Vocabulary size. */
    readonly vocabularySize: number;
    /** Share of the total weight that goes to terminals, in (0, 1]. */
    readonly terminalShare: number;
    /** Weight-averaged arity of the non-terminals (0 if there are none). */
    readonly meanArity: number;
    /**
     * `(1 − terminalShare) × meanArity`: above 1, trees tend to grow until cut by
     * maxDepth/maxNodes.
     */
    readonly growth: number;
}

/** Axes a caller may pin instead of drawing (the others are drawn by `drawGrammar`). */
export interface GrammarPins {
    readonly size?: SizeProfileId;
    readonly shareDepth?: number;
    readonly space?: ColorSpaceId;
}

/** Options of `sampleGrammars` (sample.ts); the offline dataset passes the seeds budget. */
export interface SampleOptions extends GrammarPins {
    readonly baseSeed?: number;
    readonly seedsPerGrammar?: number;
}
