import { createGrammar, getGrammarPreset } from '../grammar';
import { createSeed } from '../seed';
import type { Seed } from '../seed';

/** Numeric seeds are convenience labels here; the identity is their decimal string. */
export function seedOf(n: number): Seed {
    return createSeed(String(n));
}

/** Narrow `value` for tests: `toBeDefined` does not narrow the type. */
export function defined<T>(value: T | undefined, label = 'value'): T {
    if (value === undefined) {
        throw new Error(`Expected ${label} to be defined`);
    }
    return value;
}

/** Spread of seeds shared by the property-style suites. */
export const SEEDS = [0, 1, 2, 7, 42, 99] as const;

/**
 * Tolerance (ulp-scale) for range assertions on `evaluate`: results may exceed [-1, 1] by a few
 * ulp.
 */
export const EPS = 1e-9;

/** Grammar sizes shared by the test suites: depth and node bounds grow with the preset. */
export const SIZE_GRAMMARS = [
    createGrammar({
        weights: getGrammarPreset('default').grammar.weights,
        minDepth: 1,
        maxDepth: 3,
        maxNodes: 12,
        shareDepth: 1,
    }),
    createGrammar({
        weights: getGrammarPreset('default').grammar.weights,
        minDepth: 2,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 2,
    }),
    createGrammar({
        weights: getGrammarPreset('default').grammar.weights,
        minDepth: 3,
        maxDepth: 7,
        maxNodes: 50,
        shareDepth: 3,
    }),
];
