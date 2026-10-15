import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { describeGrammar } from './describe.ts';
import { defaultGrammar } from './grammar.ts';
import { randomizeWeights } from './randomize.ts';
import { serializeGrammar } from './serialize.ts';
import { MAX_DEPTH, MAX_NODES, MAX_WEIGHT, MIN_WEIGHT } from './types.ts';

const catalog = createDefaultCatalog();
const seeds = Array.from({ length: 200 }, (_, i) => createSeed(i));

describe('randomizeWeights', () => {
    it('keeps constraints and weights within bounds; vocabulary becomes the positive-weight set', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds) {
            const next = randomizeWeights(catalog, base, createRng(seed));

            expect(next.constraints).toEqual(base.constraints);

            for (const weight of Object.values(next.weights)) {
                expect(weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
                expect(weight).toBeLessThanOrEqual(MAX_WEIGHT);
            }

            for (const operator of catalog.operators()) {
                expect(Object.hasOwn(next.weights, operator.name)).toBe(true);
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

it('never switches x and y off by default, even when toggling aggressively', () => {
    const base = defaultGrammar(catalog);

    for (const seed of seeds.slice(0, 50)) {
        const next = randomizeWeights(catalog, base, createRng(seed), { changeRate: 1 });

        expect(next.weights.x).toBeGreaterThan(0);
        expect(next.weights.y).toBeGreaterThan(0);
    }
});

it('can disable operators with changeRate 1 and keep=[]', () => {
    const base = defaultGrammar(catalog);
    const next = randomizeWeights(catalog, base, createRng(createSeed(3)), {
        changeRate: 1,
        keep: [],
    });

    // At least one active terminal remains.
    const active = Object.entries(next.weights).filter(([, w]) => w > 0);
    expect(active.length).toBeGreaterThan(0);
    expect(active.some(([name]) => catalog.operator(name).inputs.length === 0)).toBe(true);
});

describe('randomizeWeights (grammar exploration)', () => {
    it('always returns a grammar the generator can use', () => {
        const base = defaultGrammar(catalog);

        for (const seed of seeds) {
            const next = randomizeWeights(catalog, base, createRng(seed));
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
            current = randomizeWeights(catalog, current, rng);

            for (const weight of Object.values(current.weights)) {
                expect(weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
                expect(weight).toBeLessThanOrEqual(MAX_WEIGHT);
            }
        }

        expect(() => generate(catalog, current, createSeed(1))).not.toThrow();
    });

    it('is deterministic for a given rng seed', () => {
        const base = defaultGrammar(catalog);
        const a = randomizeWeights(catalog, base, createRng(createSeed(99)));
        const b = randomizeWeights(catalog, base, createRng(createSeed(99)));

        expect(serializeGrammar(a)).toEqual(serializeGrammar(b));
    });
});
