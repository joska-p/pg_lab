import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { CONFIG } from '../config/config';
import { generate } from '../generator/generator';
import { createRng } from '../random/rng';
import { createSeed } from '../random/seed';
import { constraintsOf, createGrammar, getVocabulary, weightOf } from './grammar';
import { deriveSeed, drawGrammar, grammarKey, itemSeeds, SIZE_PROFILE_IDS } from './quantized';
import { grammarRegistry } from './registry';

const catalog = createDefaultCatalog();
const rngAt = (seed: number) => createRng(createSeed(seed));

describe('the quantized axes', () => {
    it('materializes every configured size profile in draw order', () => {
        expect(SIZE_PROFILE_IDS).toEqual(Object.keys(CONFIG.grammar.sizeProfiles));
        expect(SIZE_PROFILE_IDS).toContain('medium');
    });

    it('grammarKey is stable and distinguishes each axis', () => {
        const base = grammarRegistry.default;
        const same = createGrammar({
            weights: base.weights,
            size: base.size,
            shareDepth: base.shareDepth,
            space: base.space,
        });

        expect(grammarKey(same)).toBe(grammarKey(base));
        expect(
            grammarKey(
                createGrammar({
                    weights: base.weights,
                    size: base.size,
                    shareDepth: base.shareDepth + 1,
                    space: base.space,
                }),
            ),
        ).not.toBe(grammarKey(base));
    });
});

describe('drawGrammar', () => {
    it('is deterministic for a given rng seed', () => {
        const a = drawGrammar(rngAt(7));
        const b = drawGrammar(rngAt(7));

        expect(grammarKey(a)).toBe(grammarKey(b));
    });

    it('draws integers in [0, maxWeight] and a usable vocabulary', () => {
        for (let seed = 1; seed <= 100; seed++) {
            const grammar = drawGrammar(rngAt(seed));

            for (const operator of catalog.operators()) {
                const weight = weightOf(grammar.weights, operator.name);
                expect(Number.isInteger(weight)).toBe(true);
                expect(weight).toBeGreaterThanOrEqual(0);
                expect(weight).toBeLessThanOrEqual(CONFIG.grammar.maxWeight);
            }

            const vocabulary = getVocabulary(grammar.weights);
            expect(vocabulary.some((operator) => operator.isTerminal)).toBe(true);
            expect(vocabulary.some((operator) => !operator.isTerminal)).toBe(true);
            expect(() => generate(grammar, createSeed(seed))).not.toThrow();
        }
    });

    it('honours pinned size, shareDepth and color space', () => {
        for (let seed = 1; seed <= 30; seed++) {
            const grammar = drawGrammar(rngAt(seed), {
                size: 'small',
                shareDepth: 3,
                space: 'oklab',
            });

            expect(grammar.size).toBe('small');
            expect(grammar.shareDepth).toBe(3);
            expect(grammar.space).toBe('oklab');
        }
    });

    it('clamps a pinned shareDepth to the pinned profile', () => {
        const grammar = drawGrammar(rngAt(1), { size: 'small', shareDepth: 99 });

        expect(grammar.shareDepth).toBe(constraintsOf('small').maxDepth);
    });

    it('reaches both edges of the weight axis over a sample', () => {
        const weights = new Set<number>();

        for (let seed = 1; seed <= 100; seed++) {
            const grammar = drawGrammar(rngAt(seed));

            for (const weight of Object.values(grammar.weights)) {
                weights.add(weight ?? 0);
            }
        }

        expect(weights.has(0)).toBe(true);
        expect(weights.has(CONFIG.grammar.maxWeight)).toBe(true);
    });
});

describe('seed derivation', () => {
    it('is deterministic and distinct per index', () => {
        const seeds = Array.from({ length: 20 }, (_, index) => deriveSeed(7, index));

        expect(new Set(seeds).size).toBe(20);
        expect(deriveSeed(7, 3)).toBe(seeds[3]);
    });

    it('itemSeeds gives distinct, index-stable image seeds', () => {
        const first = itemSeeds(11, 0, 16);
        const second = itemSeeds(11, 1, 16);

        expect(new Set(first).size).toBe(16);
        expect(new Set(second).size).toBe(16);
        expect(first).toEqual(itemSeeds(11, 0, 16));
    });
});
