import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { describeGrammar } from './describe.ts';
import { defaultGrammar } from './grammar.ts';
import { randomizeGrammar, randomizeVocabulary, randomizeWeights } from './randomize.ts';
import { serializeGrammar } from './serialize.ts';
import { MAX_DEPTH, MAX_NODES, MAX_WEIGHT, MIN_WEIGHT } from './types.ts';

const catalog = createDefaultCatalog();
const seeds = Array.from({ length: 200 }, (_, i) => createSeed(i));

describe('randomizeWeights', () => {
    it('keeps vocabulary and constraints, and stays within weight bounds', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds) {
            const next = randomizeWeights(catalog, base, createRng(seed));

            expect(Object.keys(next.weights)).toEqual(Object.keys(base.weights));
            expect(next.constraints).toEqual(base.constraints);

            for (const weight of Object.values(next.weights)) {
                expect(weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
                expect(weight).toBeLessThanOrEqual(MAX_WEIGHT);
            }
        }
    });

    it('preserves the terminal share (up to rounding) by default', () => {
        const base = defaultGrammar(catalog);
        const before = describeGrammar(catalog, base).terminalShare;

        for (const seed of seeds.slice(0, 50)) {
            const after = describeGrammar(
                catalog,
                randomizeWeights(catalog, base, createRng(seed)),
            ).terminalShare;

            expect(Math.abs(after - before)).toBeLessThan(0.02);
        }
    });

    it('is deterministic for a given rng seed', () => {
        const base = defaultGrammar(catalog);
        const a = randomizeWeights(catalog, base, createRng(createSeed(7)));
        const b = randomizeWeights(catalog, base, createRng(createSeed(7)));

        expect(serializeGrammar(a)).toEqual(serializeGrammar(b));
    });

    it('rejects an invalid spread', () => {
        const base = defaultGrammar(catalog);

        expect(() =>
            randomizeWeights(catalog, base, createRng(createSeed(1)), { spread: 0.5 }),
        ).toThrow(/spread/);
    });
});

describe('randomizeVocabulary', () => {
    it('never removes x and y by default, even when everything toggles', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds.slice(0, 50)) {
            const next = randomizeVocabulary(catalog, base, createRng(seed), { changeRate: 1 });

            expect(next.weights.x).toBeDefined();
            expect(next.weights.y).toBeDefined();
        }
    });

    it('leaves the vocabulary unchanged with changeRate 0', () => {
        const base = defaultGrammar(catalog);
        const next = randomizeVocabulary(catalog, base, createRng(createSeed(3)), {
            changeRate: 0,
        });

        expect(Object.keys(next.weights)).toEqual(Object.keys(base.weights));
    });

    it('repairs the vocabulary when keep is disabled (always a valid grammar)', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds.slice(0, 100)) {
            const next = randomizeVocabulary(catalog, base, createRng(seed), {
                changeRate: 0.9,
                keep: [],
            });

            expect(describeGrammar(catalog, next).terminalShare).toBeGreaterThan(0);
        }
    });
});

describe('randomizeGrammar', () => {
    it('always returns a grammar the generator can use', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds) {
            const next = randomizeGrammar(catalog, base, createRng(seed));
            const { minDepth, maxDepth, maxNodes } = next.constraints;

            expect(minDepth).toBeGreaterThanOrEqual(1);
            expect(minDepth).toBeLessThanOrEqual(maxDepth);
            expect(maxDepth).toBeLessThanOrEqual(MAX_DEPTH);
            expect(maxNodes).toBeLessThanOrEqual(MAX_NODES);
            expect(() => generate(catalog, next, createSeed(1))).not.toThrow();
        }
    });

    it('keeps weights in bounds after many successive randomizations', () => {
        const rng = createRng(createSeed(2026));
        let current = defaultGrammar(catalog);

        for (let i = 0; i < 300; i++) {
            current = randomizeGrammar(catalog, current, rng);

            for (const weight of Object.values(current.weights)) {
                expect(weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
                expect(weight).toBeLessThanOrEqual(MAX_WEIGHT);
            }
        }

        expect(() => generate(catalog, current, createSeed(1))).not.toThrow();
    });

    it('respects disabled dimensions', () => {
        const base = defaultGrammar(catalog);
        const next = randomizeGrammar(catalog, base, createRng(createSeed(11)), {
            dimensions: { vocabulary: false, constraints: false },
        });

        expect(Object.keys(next.weights)).toEqual(Object.keys(base.weights));
        expect(next.constraints).toEqual(base.constraints);
    });

    it('is deterministic for a given rng seed', () => {
        const base = defaultGrammar(catalog);
        const a = randomizeGrammar(catalog, base, createRng(createSeed(99)));
        const b = randomizeGrammar(catalog, base, createRng(createSeed(99)));

        expect(serializeGrammar(a)).toEqual(serializeGrammar(b));
    });
});
