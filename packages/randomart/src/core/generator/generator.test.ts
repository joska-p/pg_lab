import { describe, expect, it } from 'vite-plus/test';

import { catalog } from '../catalog/default';
import type { SizeProfileId } from '../config/types';
import { depth, nodeCount } from '../expression/expression';
import type { Node } from '../expression/types';
import { constraintsOf, createGrammar, getVocabulary } from '../grammar/grammar';
import { grammarRegistry } from '../grammar/registry';
import type { Grammar } from '../grammar/types';
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

    const operator = catalog.operator(node.operatorName);

    node.params.forEach((param, i) => {
        const { min, max, step } = operator.params[i];

        expect(param).toBeGreaterThanOrEqual(min);
        expect(param).toBeLessThanOrEqual(max);
        expect(param).toBe(
            step === undefined ? Math.round(param * 1000) / 1000 : Math.round(param),
        );
    });
}

function checkExpression(grammar: Grammar, seed: number): void {
    const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);
    const allowedOperators = new Set(
        getVocabulary(grammar.weights).map((operator) => operator.name),
    );
    const expression = generate(grammar, createSeed(seed));

    for (const channel of [expression.r, expression.g, expression.b]) {
        expect(nodeCount(channel)).toBeLessThanOrEqual(maxNodes);
        expect(depth(channel)).toBeLessThanOrEqual(maxDepth);
        checkNodeInvariants(channel, 1, minDepth, maxDepth, allowedOperators);
    }
}

describe('generator', () => {
    it('draws cycles uniformly over 1, 2 and 3', () => {
        const grammar = grammarRegistry.default;
        const counts = new Map<number, number>();
        let total = 0;

        const visit = (node: Node): void => {
            if (node.operatorName === 'x' || node.operatorName === 'y') {
                const cycles = node.params[2];

                counts.set(cycles, (counts.get(cycles) ?? 0) + 1);
                total++;
            }

            node.inputs.forEach(visit);
        };

        for (let seed = 0; seed < 3000; seed++) {
            const expression = generate(grammar, createSeed(seed));

            visit(expression.r);
            visit(expression.g);
            visit(expression.b);
        }

        expect([...counts.keys()].sort()).toEqual([1, 2, 3]);

        for (const count of counts.values()) {
            // Uniform is 1/3 each; the old 25/50/25 law would put 2 cycles near 0.5.
            expect(count / total).toBeGreaterThan(0.28);
            expect(count / total).toBeLessThan(0.38);
        }
    });

    it('exports GENERATOR_VERSION as a number', () => {
        expect(typeof GENERATOR_VERSION).toBe('number');
        expect(GENERATOR_VERSION).toBeGreaterThanOrEqual(1);
    });

    it('generates expressions satisfying all grammar invariants across various seeds', () => {
        const grammar = grammarRegistry.default;

        for (const seed of [1, 42, 999, 314159]) {
            checkExpression(grammar, seed);
        }
    });

    it('respects every size profile budget', () => {
        const base = grammarRegistry.default;
        const sizes: readonly SizeProfileId[] = ['small', 'medium', 'large'];

        for (const size of sizes) {
            const grammar = createGrammar({
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
        const base = grammarRegistry.default;
        const { maxDepth } = constraintsOf(base.size);

        for (let shareDepth = 0; shareDepth <= maxDepth; shareDepth++) {
            const grammar = createGrammar({
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
        const grammar = createGrammar({
            weights: { x: 1, neg: 1 },
            size: 'small',
            shareDepth: 0,
            space: 'srgb',
        });

        for (const seed of [123, 456]) {
            const expression = generate(grammar, createSeed(seed));
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
        const grammar = grammarRegistry.default;
        const seed = createSeed(1337);

        const expr1 = generate(grammar, seed);
        const expr2 = generate(grammar, seed);

        expect(JSON.stringify(expr1)).toBe(JSON.stringify(expr2));
    });

    it('different seeds produce different expressions', () => {
        const grammar = grammarRegistry.default;
        const expr1 = generate(grammar, createSeed(1));
        const expr2 = generate(grammar, createSeed(2));

        expect(JSON.stringify(expr1)).not.toBe(JSON.stringify(expr2));
    });

    // The version rides with the output it describes: a bump without regenerating this snapshot
    // fails, and a draw-affecting CONFIG change without a bump shows the stale version in the diff.
    it('reproducibility snapshot on fixed seeds, stamped with the generator version', () => {
        const grammar = grammarRegistry.default;

        expect({
            generatorVersion: GENERATOR_VERSION,
            seed0: generate(grammar, createSeed(0)),
            seed42: generate(grammar, createSeed(42)),
        }).toMatchSnapshot();
    });
});
