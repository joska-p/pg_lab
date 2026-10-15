import type { Brand } from '../shared/index.ts';

export interface Constraints {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

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
