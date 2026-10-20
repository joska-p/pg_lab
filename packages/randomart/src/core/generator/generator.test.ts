import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import type { SizeProfileId } from '../config/config';
import { depth, nodeCount } from '../expression/expression';
import type { Node } from '../expression/types';
import { constraintsOf, createGrammar, getVocabulary } from '../grammar/grammar';
import { defaultGrammar } from '../grammar/presets';
import { createSeed } from '../random/seed';
import { GENERATOR_VERSION, generate } from './generator';

function checkNodeInvariants(
    node: Node,
    currentDepth: number,
    minDepth: number,
    maxDepth: number,
    allowedOperators: ReadonlySet<string>,
): void {
    expect(allowedOperators.has(node.operatorName)).toBe(true);
    if (node.inputs.length === 0) {
        expect(currentDepth).toBeGreaterThanOrEqual(minDepth);
        expect(currentDepth).toBeLessThanOrEqual(maxDepth);
    } else {
        expect(currentDepth).toBeLessThan(maxDepth);
        for (const child of node.inputs) {
            checkNodeInvariants(child, currentDepth + 1, minDepth, maxDepth, allowedOperators);
        }
    }

    for (const param of node.params) {
        expect(Number.isFinite(param)).toBe(true);
        expect(param).toBeGreaterThanOrEqual(-1);
        expect(param).toBeLessThanOrEqual(1);
        const rounded = Math.round(param * 1000) / 1000;
        expect(param).toBe(rounded);
    }
}

const catalog = createDefaultCatalog();

function checkExpression(grammar: ReturnType<typeof defaultGrammar>, seed: number): void {
    const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);
    const allowedOperators = new Set(
        getVocabulary(catalog, grammar.weights).map((operator) => operator.name),
    );
    const expression = generate(catalog, grammar, createSeed(seed));

    for (const channel of [expression.r, expression.g, expression.b]) {
        expect(nodeCount(channel)).toBeLessThanOrEqual(maxNodes);
        expect(depth(channel)).toBeLessThanOrEqual(maxDepth);
        checkNodeInvariants(channel, 1, minDepth, maxDepth, allowedOperators);
    }
}

describe('generator', () => {
    it('exports GENERATOR_VERSION as a number', () => {
        expect(typeof GENERATOR_VERSION).toBe('number');
        expect(GENERATOR_VERSION).toBeGreaterThanOrEqual(1);
    });

    it('generates expressions satisfying all grammar invariants across various seeds', () => {
        const grammar = defaultGrammar(catalog);

        for (const seed of [1, 42, 999, 314159]) {
            checkExpression(grammar, seed);
        }
    });

    it('respects every size profile budget', () => {
        const base = defaultGrammar(catalog);
        const sizes: readonly SizeProfileId[] = ['small', 'medium', 'large'];

        for (const size of sizes) {
            const grammar = createGrammar(catalog, {
                weights: base.weights,
                size,
                shareDepth: 0,
                space: 'oklch',
            });

            for (const seed of [1, 42, 999]) {
                checkExpression(grammar, seed);
            }
        }
    });

    it('respects the invariants at every shared-trunk depth (0 … maxDepth)', () => {
        const base = defaultGrammar(catalog);
        const { maxDepth } = constraintsOf(base.size);

        for (let shareDepth = 0; shareDepth <= maxDepth; shareDepth++) {
            const grammar = createGrammar(catalog, {
                weights: base.weights,
                size: base.size,
                shareDepth,
                space: 'oklch',
            });

            for (const seed of [1, 42, 1234]) {
                checkExpression(grammar, seed);
            }
        }
    });

    it('handles a minimal vocabulary: one terminal and one unary non-terminal', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1 },
            size: 'small',
            shareDepth: 0,
            space: 'srgb',
        });

        for (const seed of [123, 456]) {
            const expression = generate(catalog, grammar, createSeed(seed));
            const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);

            for (const channel of [expression.r, expression.g, expression.b]) {
                expect(channel.operatorName).toBe('neg'); // terminals cannot appear before minDepth
                expect(nodeCount(channel)).toBeLessThanOrEqual(maxNodes);
                expect(depth(channel)).toBeGreaterThanOrEqual(minDepth);
                expect(depth(channel)).toBeLessThanOrEqual(maxDepth);
            }
        }
    });

    it('is strictly deterministic: same seed produces identical expression', () => {
        const grammar = defaultGrammar(catalog);
        const seed = createSeed(1337);

        const expr1 = generate(catalog, grammar, seed);
        const expr2 = generate(catalog, grammar, seed);

        expect(JSON.stringify(expr1)).toBe(JSON.stringify(expr2));
    });

    it('different seeds produce different expressions', () => {
        const grammar = defaultGrammar(catalog);
        const expr1 = generate(catalog, grammar, createSeed(1));
        const expr2 = generate(catalog, grammar, createSeed(2));

        expect(JSON.stringify(expr1)).not.toBe(JSON.stringify(expr2));
    });

    it('reproducibility snapshots on fixed seeds', () => {
        const grammar = defaultGrammar(catalog);

        const exprSeed0 = generate(catalog, grammar, createSeed(0));
        const exprSeed42 = generate(catalog, grammar, createSeed(42));

        expect(exprSeed0).toMatchSnapshot();
        expect(exprSeed42).toMatchSnapshot();
    });
});
