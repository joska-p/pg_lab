import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import {
    MAX_WEIGHT,
    createGrammar,
    grammarRegistry,
    isOnlyNonTerminal,
    isOnlyTerminal,
    minimumNodes,
    weightOf,
} from '@repo/randomart-core/grammar';
import { OP_NAMES } from '@repo/randomart-core/ops';
import { createRng } from '@repo/randomart-core/rng';
import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import {
    withMaxDepth,
    withMaxNodes,
    withMinDepth,
    withShareDepth,
    withSpace,
    withWeight,
} from './grammarEdits';

describe('withMinDepth / withMaxNodes (G1: weights {add:1, x:1}, minDepth 2, maxDepth 8, maxNodes 25)', () => {
    const G1 = createGrammar({
        weights: { add: 1, x: 1 },
        minDepth: 2,
        maxDepth: 8,
        maxNodes: 25,
        shareDepth: 0,
        space: 'srgb',
    });

    it('clamps minDepth to the feasible ceiling without moving maxDepth', () => {
        const next = withMinDepth(G1, 8);
        expect(next.minDepth).toBe(4); // 2^4 - 1 = 15 <= 25 < 31 = 2^5 - 1
        expect(next.maxDepth).toBe(8);
    });

    it('raises maxNodes to the minimum budget', () => {
        const next = withMaxNodes(withMinDepth(G1, 4), 5);
        expect(next.maxNodes).toBe(15); // minimumNodes at minDepth 4
    });
});

describe('default preset (minDepth 2, maxDepth 5, maxNodes 25, shareDepth 2)', () => {
    const g = grammarRegistry.default.grammar;

    it('withMaxDepth(1) pulls minDepth and shareDepth down to 1', () => {
        const next = withMaxDepth(g, 1);
        expect(next.minDepth).toBe(1);
        expect(next.maxDepth).toBe(1);
        expect(next.shareDepth).toBe(1);
    });

    it('withMinDepth(7) pushes maxDepth up, keeps shareDepth', () => {
        const next = withMinDepth(g, 7);
        expect(next.minDepth).toBe(7);
        expect(next.maxDepth).toBe(7);
        expect(next.shareDepth).toBe(2);
    });
});

describe('withWeight (G2: weights {neg:1, mix:1, x:1}, minDepth 5, maxDepth 6, maxNodes 10)', () => {
    const G2 = createGrammar({
        weights: { neg: 1, mix: 1, x: 1 },
        minDepth: 5,
        maxDepth: 6,
        maxNodes: 10,
        shareDepth: 0,
        space: 'srgb',
    });

    it('removing the last unary operator lowers minDepth to 2', () => {
        const next = withWeight(G2, 'neg', 0);
        expect(next.minDepth).toBe(2); // mix-only: depth 3 needs 13 nodes > 10; depth 2 needs 4
        expect(weightOf(next, 'neg')).toBe(0);
    });
});

describe('deterministic random walk over the six edits', () => {
    it('never produces an infeasible grammar', () => {
        const rng = createRng(createSeed('walk'));
        let grammar = grammarRegistry.default.grammar;

        for (let i = 0; i < 500; i++) {
            switch (rng.int(6)) {
                case 0: {
                    const name = rng.pick(OP_NAMES);
                    const low =
                        isOnlyTerminal(grammar, name) || isOnlyNonTerminal(grammar, name) ? 1 : 0;
                    grammar = withWeight(grammar, name, low + rng.int(MAX_WEIGHT - low + 1));
                    break;
                }
                case 1: {
                    grammar = withMinDepth(grammar, 1 + rng.int(8));
                    break;
                }
                case 2: {
                    grammar = withMaxDepth(grammar, 1 + rng.int(10));
                    break;
                }
                case 3: {
                    grammar = withMaxNodes(grammar, 4 + rng.int(97));
                    break;
                }
                case 4: {
                    grammar = withShareDepth(grammar, rng.int(grammar.maxDepth + 1));
                    break;
                }
                default: {
                    grammar = withSpace(grammar, rng.pick(COLOR_SPACE_IDS));
                    break;
                }
            }
            // Edits never throw: they adjust neighbouring values themselves; invariants must hold.
            expect(minimumNodes(grammar)).toBeLessThanOrEqual(grammar.maxNodes);
            expect(grammar.minDepth).toBeLessThanOrEqual(grammar.maxDepth);
        }
    });
});
