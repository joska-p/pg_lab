import { createGrammar } from '@repo/randomart-core/grammar';
import { describe, expect, it } from 'vite-plus/test';

import { learnGrammarLevel, toGrammarPoints } from './grammarLevel';
import type { GrammarSampleRow } from './grammarLevel';

function statsOf(brightness: number) {
    return {
        brightness,
        contrast: 0.1,
        sharpness: 0.1,
        busyness: 0.1,
        colorfulness: 0.1,
        motion: 0,
    };
}

/** Brightness depends linearly on the weight of `x`; two noisy seeds per grammar. */
function syntheticRows(grammars: number): GrammarSampleRow[] {
    const rows: GrammarSampleRow[] = [];

    for (let grammarId = 0; grammarId < grammars; grammarId++) {
        const weight = 1 + (grammarId % 16);
        const grammar = createGrammar({
            weights: { add: 1, x: weight },
            minDepth: 2,
            maxDepth: 4,
            maxNodes: 25,
            shareDepth: 1,
        });

        for (const noise of [-0.005, 0.005]) {
            rows.push({ grammarId, grammar, space: 'srgb', stats: statsOf(0.02 * weight + noise) });
        }
    }

    return rows;
}

describe('learnGrammarLevel', () => {
    it('averages the seeds of one grammar into a single point', () => {
        expect(toGrammarPoints(syntheticRows(10))).toHaveLength(10);
    });

    it('generalises to held-out grammars when the signal is real', () => {
        const brightness = learnGrammarLevel(syntheticRows(80)).find(
            (result) => result.target === 'brightness',
        );

        expect(brightness?.cvR2).toBeGreaterThan(0.8);
        expect(brightness?.coef['weight.x']).toBeCloseTo(0.02, 2);
        expect(brightness?.effect['weight.x']).toBeGreaterThan(0);
    });

    it('learns nothing from groups that carry no signal', () => {
        const brightness = learnGrammarLevel(syntheticRows(80), { groups: ['space'] }).find(
            (result) => result.target === 'brightness',
        );

        expect(brightness?.cvR2).toBeLessThan(0.2);
        expect(Object.keys(brightness?.coef ?? {})).toEqual([
            'space.srgb',
            'space.oklch',
            'space.oklab',
            'space.hsl',
        ]);
    });

    it('reports every target with finite scores', () => {
        for (const result of learnGrammarLevel(syntheticRows(40))) {
            expect(Number.isFinite(result.trainR2)).toBe(true);
            expect(Number.isFinite(result.cvR2)).toBe(true);
        }
    });
});
