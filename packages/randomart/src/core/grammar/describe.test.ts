import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { describeGrammar } from './describe.ts';
import { createGrammar } from './grammar.ts';

const catalog = createDefaultCatalog();

describe('describeGrammar', () => {
    it('reports zero growth for a terminal-only grammar', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, y: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.vocabularySize).toBe(2);
        expect(summary.terminalShare).toBe(1);
        expect(summary.meanArity).toBe(0);
        expect(summary.growth).toBe(0);
    });

    it('computes share and mean arity on a small grammar', () => {
        // terminals: x(1) = 1 ; non-terminals: neg(arity 1, w 1), add(arity 2, w 2) → total 4
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1, add: 2 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.terminalShare).toBeCloseTo(0.25);
        expect(summary.meanArity).toBeCloseTo((1 * 1 + 2 * 2) / 3);
        expect(summary.growth).toBeCloseTo(0.75 * ((1 + 4) / 3));
    });
});
