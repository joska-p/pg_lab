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

export const MIN_WEIGHT = 0.01;
export const MAX_WEIGHT = 100;
export const MAX_DEPTH = 16;
export const MAX_NODES = 400;
