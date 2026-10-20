import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { describeGrammar } from './describe.ts';
import { createGrammar } from './grammar.ts';

const catalog = createDefaultCatalog();

describe('describeGrammar', () => {
    it('reports equal shares for one terminal and one non-terminal', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1 },
            size: 'small',
            shareDepth: 2,
            space: 'oklch',
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.vocabularySize).toBe(2);
        expect(summary.terminalShare).toBeCloseTo(0.5);
        expect(summary.meanArity).toBe(1);
        expect(summary.growth).toBeCloseTo(0.5);
    });

    it('computes share and mean arity on a small grammar', () => {
        // terminals: x(1) = 1 ; non-terminals: neg(arity 1, w 1), add(arity 2, w 2) → total 4
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1, add: 2 },
            size: 'small',
            shareDepth: 0,
            space: 'oklch',
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.terminalShare).toBeCloseTo(0.25);
        expect(summary.meanArity).toBeCloseTo((1 * 1 + 2 * 2) / 3);
        expect(summary.growth).toBeCloseTo(0.75 * ((1 + 4) / 3));
    });

    it('ignores zero weights', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, y: 0, neg: 1, add: 0 },
            size: 'small',
            shareDepth: 0,
            space: 'oklch',
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.vocabularySize).toBe(2);
        expect(summary.terminalShare).toBeCloseTo(0.5);
    });
});
