import type { OperatorId } from '../catalog/types';
import type { ColorSpaceId, SizeProfileId } from '../config/types';
import type { Brand } from '../shared/shared';

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

export interface GrammarPreset {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly grammar: Grammar;
}

/** Plain JSON representation of a Grammar (for serialization, IPC, storage). */
export interface GrammarData {
    readonly weights: Readonly<Record<string, number>>;
    readonly size: SizeProfileId;
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}
