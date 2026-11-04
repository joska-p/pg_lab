import { describe, expect, it } from 'vite-plus/test';

import { generate } from './generate';
import { createGrammar, maxFeasibleMinDepth, minimumNodes } from './grammar';
import { seedOf } from './testing/fixtures';
import type { Expression, Node } from './tree';

function countNodes(node: Node): number {
    return 1 + node.inputs.reduce((total, child) => total + countNodes(child), 0);
}

function maxChannelNodes(expression: Expression): number {
    return Math.max(countNodes(expression.r), countNodes(expression.g), countNodes(expression.b));
}

const BASE_OPTIONS = {
    weights: { add: 1, x: 1 },
    minDepth: 3,
    maxDepth: 5,
    shareDepth: 1,
    space: 'srgb' as const,
};

describe('minimumNodes', () => {
    it('createGrammar succeeds at the minimum budget; minimumNodes is 7; generation stays within budget', () => {
        const grammar = createGrammar({ ...BASE_OPTIONS, maxNodes: 7 });
        expect(minimumNodes(grammar)).toBe(7);

        for (const seed of [1, 2, 3, 4, 5]) {
            const expression = generate(grammar, seedOf(seed));
            expect(maxChannelNodes(expression)).toBeLessThanOrEqual(grammar.maxNodes);
        }
    });

    it('one node below the minimum is infeasible', () => {
        expect(() => createGrammar({ ...BASE_OPTIONS, maxNodes: 6 })).toThrow(
            /Grammar is infeasible/,
        );
    });

    it('does not depend on shareDepth', () => {
        const size = minimumNodes(createGrammar({ ...BASE_OPTIONS, maxNodes: 40, shareDepth: 0 }));
        for (let shareDepth = 1; shareDepth <= BASE_OPTIONS.maxDepth; shareDepth++) {
            expect(minimumNodes(createGrammar({ ...BASE_OPTIONS, maxNodes: 40, shareDepth }))).toBe(
                size,
            );
        }
    });
});

describe('maxFeasibleMinDepth', () => {
    const OPTIONS = {
        weights: { add: 1, x: 1 },
        maxDepth: 8,
        shareDepth: 0,
        space: 'srgb' as const,
    };

    it('returns the largest minDepth whose minimumNodes fits maxNodes (15 <= 25 < 31)', () => {
        const grammar = createGrammar({ ...OPTIONS, minDepth: 1, maxNodes: 25 });
        expect(maxFeasibleMinDepth(grammar, 8)).toBe(4);
    });

    it('never goes below 1', () => {
        const grammar = createGrammar({ ...OPTIONS, minDepth: 1, maxNodes: 1 });
        expect(maxFeasibleMinDepth(grammar, 8)).toBe(1);
    });
});
