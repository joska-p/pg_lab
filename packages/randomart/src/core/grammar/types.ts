import type { OperatorId } from '../catalog/index.ts';
import type { ChannelModel } from '../color/index.ts';
import type { Brand } from '../shared/index.ts';

/**
 * Raw constraints as callers may write them: UI fields, hand-edited state, parsed JSON. Carries no
 * guarantee — `createConstraints` repairs it into the brand (throw-vs-repair policy in
 * shared/index.ts), findings F10.
 */
export interface ConstraintsInput {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

/**
 * Validated constraints: finite integers with `1 <= minDepth <= maxDepth <= MAX_DEPTH` and `1 <=
 * maxNodes <= MAX_NODES`. Reachable only through `createConstraints` (the shape-repair rung) or
 * `fitConstraints` (adds vocabulary feasibility — findings F11, the `ZoomClamp` analog); both
 * repair rather than throw, so the brand is provably valid whatever the raw input was.
 */
export type Constraints = Brand<ConstraintsInput, 'Constraints'>;

/**
 * Weights keyed by operator id, so the static registry makes a mistyped name a compile error
 * (`defaultGrammar` is protected this way). Partial: an absent operator is simply off — only the
 * vocabulary an author chose is present. Values stay raw numbers; validation lives in
 * `createGrammar` (throw-vs-repair policy in shared/index.ts).
 */
export type GrammarWeights = Readonly<Partial<Record<OperatorId, number>>>;

export type Grammar = Brand<
    {
        readonly weights: GrammarWeights;
        readonly constraints: Constraints;
        /**
         * How the generated tree(s) become colour, and how much structure they share (see
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
/**
 * Smallest strictly positive weight. A weight of exactly 0 means "off"; anything above it is a live
 * weight, and this floor keeps rounding from silently switching an operator off. The UI also uses
 * it as the weight floor of the last active terminal, whose removal `createGrammar` refuses.
 */
export const MIN_ACTIVE_WEIGHT = 0.001;
export const MAX_DEPTH = 16;
export const MAX_NODES = 400;
