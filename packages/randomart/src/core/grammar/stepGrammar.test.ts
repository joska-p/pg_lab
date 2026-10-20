import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { CONFIG } from '../config/config';
import { generate } from '../generator/generator';
import { createRng } from '../random/rng';
import { createSeed } from '../random/seed';
import { getVocabulary, constraintsOf, createGrammar, weightOf } from './grammar';
import { defaultGrammar } from './presets';
import { grammarKey, stepGrammar } from './quantized';

const catalog = createDefaultCatalog();
const rngAt = (seed: number) => createRng(createSeed(seed));

const base = createGrammar(catalog, {
    weights: { x: 1, y: 1, const: 1, neg: 1, add: 1, mul: 1 },
    size: 'medium',
    shareDepth: 2,
    space: 'oklch',
});

describe('stepGrammar', () => {
    it('is deterministic for a given rng seed', () => {
        const a = stepGrammar(catalog, base, rngAt(1));
        const b = stepGrammar(catalog, base, rngAt(1));

        expect(grammarKey(catalog, a)).toBe(grammarKey(catalog, b));
    });

    it('moves each operator by at most one notch', () => {
        for (let seed = 1; seed <= 100; seed++) {
            const stepped = stepGrammar(catalog, base, rngAt(seed));

            for (const operator of catalog.operators()) {
                const before = weightOf(base.weights, operator.name);
                const after = weightOf(stepped.weights, operator.name);

                expect(Math.abs(after - before)).toBeLessThanOrEqual(1);
            }
        }
    });

    it('keeps every weight on the grid and always yields a usable grammar', () => {
        let current = base;

        for (let seed = 1; seed <= 200; seed++) {
            current = stepGrammar(catalog, current, rngAt(seed), { changeRate: 1 });

            for (const operator of catalog.operators()) {
                const weight = weightOf(current.weights, operator.name);
                expect(Number.isInteger(weight)).toBe(true);
                expect(weight).toBeGreaterThanOrEqual(0);
                expect(weight).toBeLessThanOrEqual(CONFIG.grammar.maxWeight);
            }

            const vocabulary = getVocabulary(catalog, current.weights);
            expect(vocabulary.some((operator) => operator.isTerminal)).toBe(true);
            expect(vocabulary.some((operator) => !operator.isTerminal)).toBe(true);
            expect(() => generate(catalog, current, createSeed(1))).not.toThrow();
        }
    });

    it('preserves size, shareDepth and color space', () => {
        const stepped = stepGrammar(catalog, base, rngAt(3), { changeRate: 1 });

        expect(stepped.size).toBe(base.size);
        expect(stepped.shareDepth).toBe(base.shareDepth);
        expect(stepped.space).toBe(base.space);
    });

    it('keeps a viable vocabulary even from a minimal one at changeRate 1', () => {
        const minimal = createGrammar(catalog, {
            weights: { x: 1, add: 1 },
            size: 'small',
            shareDepth: 0,
            space: 'srgb',
        });

        for (let seed = 1; seed <= 50; seed++) {
            const stepped = stepGrammar(catalog, minimal, rngAt(seed), { changeRate: 1 });
            const vocabulary = getVocabulary(catalog, stepped.weights);

            expect(vocabulary.some((operator) => operator.isTerminal)).toBe(true);
            expect(vocabulary.some((operator) => !operator.isTerminal)).toBe(true);
        }
    });

    it('leaves the grammar untouched at changeRate 0', () => {
        const stepped = stepGrammar(catalog, defaultGrammar(catalog), rngAt(5), {
            changeRate: 0,
        });

        expect(grammarKey(catalog, stepped)).toBe(grammarKey(catalog, defaultGrammar(catalog)));
        expect(constraintsOf(stepped.size)).toEqual(constraintsOf(base.size));
    });

    it('rejects an invalid changeRate', () => {
        for (const changeRate of [-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) {
            expect(() => stepGrammar(catalog, base, rngAt(1), { changeRate })).toThrow(
                /changeRate/,
            );
        }
    });
});
