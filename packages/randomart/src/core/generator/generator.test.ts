import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { depth, nodeCount } from '../expression/index.ts';
import type { Node } from '../expression/index.ts';
import { createGrammar, defaultGrammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';
import { GENERATOR_VERSION, generate } from './index.ts';

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

describe('generator', () => {
    const catalog = createDefaultCatalog();

    it('exports GENERATOR_VERSION as a number', () => {
        expect(typeof GENERATOR_VERSION).toBe('number');
        expect(GENERATOR_VERSION).toBeGreaterThanOrEqual(1);
    });

    it('generates expressions satisfying all grammar invariants across various seeds', () => {
        const grammar = defaultGrammar(catalog);
        const allowedOperators = new Set(Object.keys(grammar.weights));
        const testSeeds = [createSeed(1), createSeed(42), createSeed(999), createSeed(314159)];

        for (const seed of testSeeds) {
            const expr = generate(catalog, grammar, seed);

            for (const channel of [expr.r, expr.g, expr.b]) {
                expect(nodeCount(channel)).toBeLessThanOrEqual(grammar.constraints.maxNodes);
                expect(depth(channel)).toBeLessThanOrEqual(grammar.constraints.maxDepth);
                checkNodeInvariants(
                    channel,
                    1,
                    grammar.constraints.minDepth,
                    grammar.constraints.maxDepth,
                    allowedOperators,
                );
            }
        }
    });

    it('respects the invariants at every shared-trunk depth (0 … maxDepth)', () => {
        const base = defaultGrammar(catalog);
        const allowedOperators = new Set(Object.keys(base.weights));

        for (let shareDepth = 0; shareDepth <= base.constraints.maxDepth; shareDepth++) {
            const grammar = createGrammar(catalog, {
                weights: base.weights,
                constraints: base.constraints,
                channels: { space: 'oklch', shareDepth },
            });

            for (const seed of [createSeed(1), createSeed(42), createSeed(1234)]) {
                const expr = generate(catalog, grammar, seed);

                for (const channel of [expr.r, expr.g, expr.b]) {
                    expect(nodeCount(channel)).toBeLessThanOrEqual(grammar.constraints.maxNodes);
                    expect(depth(channel)).toBeLessThanOrEqual(grammar.constraints.maxDepth);
                    checkNodeInvariants(
                        channel,
                        1,
                        grammar.constraints.minDepth,
                        grammar.constraints.maxDepth,
                        allowedOperators,
                    );
                }
            }
        }
    });

    it('handles edge case: vocabulary with a single terminal', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
        });

        const expr = generate(catalog, grammar, createSeed(123));
        expect(expr.r.operatorName).toBe('x');
        expect(expr.g.operatorName).toBe('x');
        expect(expr.b.operatorName).toBe('x');
        expect(nodeCount(expr)).toBe(3);
    });

    it('handles edge case: minDepth === maxDepth', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1 },
            constraints: { minDepth: 3, maxDepth: 3, maxNodes: 10 },
        });

        const expr = generate(catalog, grammar, createSeed(456));
        for (const ch of [expr.r, expr.g, expr.b]) {
            expect(depth(ch)).toBe(3);
        }
    });

    it('handles edge case: maxNodes exactly equals minSize(1)', () => {
        // minDepth = 3 with only binary 'add' has minSize(1) = 7
        const grammar = createGrammar(catalog, {
            weights: { x: 1, add: 1 },
            constraints: { minDepth: 3, maxDepth: 5, maxNodes: 7 },
        });

        const expr = generate(catalog, grammar, createSeed(789));
        for (const ch of [expr.r, expr.g, expr.b]) {
            expect(nodeCount(ch)).toBe(7);
            expect(depth(ch)).toBe(3);
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
