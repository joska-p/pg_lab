import type { Brand } from '../shared/index.ts';

/**
 * Raw constraints as callers may write them: UI fields, hand-edited state, parsed JSON. Carries no
 * guarantee — validating is the job of `createConstraints` (findings F10).
 */
export interface ConstraintsInput {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

/**
 * Validated constraints: finite integers with `1 <= minDepth <= maxDepth <= MAX_DEPTH` and `1 <=
 * maxNodes <= MAX_NODES`. Reachable only through `createConstraints`; feasibility for a given
 * vocabulary (a grammar-level rule) is carried by `Grammar` and proven by `fitConstraints`
 * returning this type (findings F11 — the `ZoomClamp` analog).
 */
export type Constraints = Brand<ConstraintsInput, 'Constraints'>;

export type Grammar = Brand<
    {
        readonly weights: Readonly<Record<string, number>>;
        readonly constraints: Constraints;
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
