import type { OperatorId } from '../catalog/index.ts';
import type { ChannelModel, ColorSpaceId } from '../color/index.ts';
import type { SizeProfileId, WeightLevel } from '../config/index.ts';
import type { Brand } from '../shared/index.ts';
import type { FAMILY_IDS, SHARE_CHOICES } from './quantized.ts';

/**
 * Raw constraints as callers may write them: UI fields, hand-edited state, parsed JSON. Carries no
 * guarantee — `createConstraints` repairs it into the brand (throw-vs-repair policy in
 * shared/index.ts).
 */
export interface ConstraintsInput {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

/**
 * Validated constraints: finite integers with `1 <= minDepth <= maxDepth <= MAX_DEPTH` and `1 <=
 * maxNodes <= MAX_NODES`. Reachable only through `createConstraints` (the shape-repair rung) or
 * `fitConstraints` (adds vocabulary feasibility, the `ZoomClamp` analog); both repair rather than
 * throw, so the brand is provably valid whatever the raw input was.
 */
export type Constraints = Brand<ConstraintsInput, 'Constraints'>;

/**
 * Weights keyed by operator id, so the static registry makes a mistyped name a compile error.
 * Partial: an absent operator is simply off — only the vocabulary an author chose is present.
 * Values stay raw numbers; validation lives in `createGrammar` (throw-vs-repair policy in
 * shared/index.ts).
 */
type GrammarWeights = Readonly<Partial<Record<OperatorId, number>>>;

export type Grammar = Brand<
    {
        readonly weights: GrammarWeights;
        readonly constraints: Constraints;
        /**
         * How the generated tree(s) become color, and how much structure they share (see
         * `../color`). Always present.
         */
        readonly channels: ChannelModel;
    },
    'Grammar'
>;

/**
 * A weight of 0 is allowed and means "this operator is not in the vocabulary": it is never drawn.
 * The vocabulary of a grammar is therefore `{ name | weights[name] > 0 }`.
 */
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 100;
export const MAX_DEPTH = 16;
export const MAX_NODES = 400;

/**
 * Family of the catalog vocabulary (`FAMILY_IDS`): the grouping the sampler draws by and the UI
 * orders operator sliders with.
 */
export type FamilyId = (typeof FAMILY_IDS)[number];

/** How deep the three channels share their structure in a recipe (`SHARE_CHOICES`). */
export type ShareChoice = (typeof SHARE_CHOICES)[number];

/**
 * One point of the quantized space: a weight level per operator — the slider grid of
 * `CONFIG.recipe.levels` — plus the size, share and color axes. `recipeToGrammar` (quantized.ts) is
 * the only way down to a real `Grammar`, and "one notch away" is meaningful here, which it is not
 * on continuous weights. An absent operator reads as `NEUTRAL_LEVEL`.
 */
export interface Recipe {
    readonly levels: Readonly<Partial<Record<OperatorId, WeightLevel>>>;
    readonly size: SizeProfileId;
    /** `'mono'` = fully shared trunk (r = g = b). */
    readonly share: ShareChoice;
    readonly space: ColorSpaceId;
}

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

/** Options of `sampleGrammars` (sample.ts); the offline dataset passes the seeds budget. */
export interface SampleOptions {
    readonly baseSeed?: number;
    readonly seedsPerGrammar?: number;
    /**
     * Channel model of the drawn grammars. Defaults to `RAW_CHANNELS`, the historical dataset draw
     * (three independent trees in sRGB); the bench passes the app's `DEFAULT_CHANNELS` so its lots
     * are readable the way the play mode is.
     */
    readonly channels?: ChannelModel;
}
