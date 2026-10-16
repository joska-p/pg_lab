import { describe, expect, it } from 'vite-plus/test';

import { createRng, createSeed, MAX_SEED, randomSeed } from './index.ts';

describe('Seed', () => {
    it('creates a seed for valid non-negative 32-bit integers', () => {
        expect(createSeed(0)).toBe(0);
        expect(createSeed(123_456)).toBe(123_456);
        expect(createSeed(MAX_SEED)).toBe(MAX_SEED);
    });

    it('rejects non-integers and non-finite values', () => {
        expect(() => createSeed(1.5)).toThrow(/integer/);
        expect(() => createSeed(Number.NaN)).toThrow(/finite/);
        expect(() => createSeed(Number.POSITIVE_INFINITY)).toThrow(/finite/);
    });

    it('rejects numbers outside the 32-bit range', () => {
        expect(() => createSeed(-1)).toThrow(
            'Randomart: seed must be an integer in [0, 4294967295], received -1',
        );
        expect(() => createSeed(MAX_SEED + 1)).toThrow(
            'Randomart: seed must be an integer in [0, 4294967295], received 4294967296',
        );
    });

    it('generates random seeds within valid range', () => {
        for (let i = 0; i < 20; i++) {
            const seed = randomSeed();
            expect(Number.isInteger(seed)).toBe(true);
            expect(seed).toBeGreaterThanOrEqual(0);
            expect(seed).toBeLessThanOrEqual(MAX_SEED);
        }
    });
});

describe('Rng (mulberry32)', () => {
    it('is strictly deterministic: same seed produces identical sequences', () => {
        const rng1 = createRng(createSeed(42));
        const rng2 = createRng(createSeed(42));

        const seq1 = Array.from({ length: 50 }, () => rng1.next());
        const seq2 = Array.from({ length: 50 }, () => rng2.next());

        expect(seq1).toEqual(seq2);
    });

    it('produces distinct sequences for different seeds', () => {
        const rng1 = createRng(createSeed(42));
        const rng2 = createRng(createSeed(43));

        const seq1 = Array.from({ length: 20 }, () => rng1.next());
        const seq2 = Array.from({ length: 20 }, () => rng2.next());

        expect(seq1).not.toEqual(seq2);
    });

    it('produces values in [0, 1)', () => {
        const rng = createRng(createSeed(1337));

        for (let i = 0; i < 1000; i++) {
            const val = rng.next();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    it('generates integers in [0, maxExclusive)', () => {
        const rng = createRng(createSeed(999));
        const max = 7;
        const seen = new Set<number>();

        for (let i = 0; i < 500; i++) {
            const val = rng.int(max);
            expect(Number.isInteger(val)).toBe(true);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(max);
            seen.add(val);
        }

        expect(seen.size).toBe(max);
    });

    it('rejects invalid maxExclusive for int()', () => {
        const rng = createRng(createSeed(123));

        expect(() => rng.int(0)).toThrow('Randomart: maxExclusive must be >= 1, received 0');
        expect(() => rng.int(-5)).toThrow('Randomart: maxExclusive must be >= 1, received -5');
        expect(() => rng.int(2.5)).toThrow(
            'Randomart: maxExclusive must be an integer, received 2.5',
        );
        expect(() => rng.int(Number.NaN)).toThrow(
            'Randomart: maxExclusive must be a finite number, received NaN',
        );
    });

    describe('weighted', () => {
        it('calls weightOf exactly once per item (findings F17 fixed: single pass)', () => {
            const rng = createRng(createSeed(1));

            let calls = 0;

            rng.weighted(['a', 'b', 'c'], () => {
                calls++;
                return 1;
            });

            expect(calls).toBe(3);
        });

        it('consumes exactly one next() call even with a single item', () => {
            const rngA = createRng(createSeed(500));
            const rngB = createRng(createSeed(500));

            const chosen = rngA.weighted(['single'], () => 10);
            expect(chosen).toBe('single');

            // rngB called next() directly once; both RNGs should now be in the exact same state
            expect(rngB.next()).toBeDefined();
            expect(rngA.next()).toBe(rngB.next());
        });

        it('respects weights distribution over many draws', () => {
            const rng = createRng(createSeed(2026));
            const items = [
                { id: 'common', weight: 3 },
                { id: 'rare', weight: 1 },
            ] as const;

            const counts = { common: 0, rare: 0 };
            const iterations = 4000;

            for (let i = 0; i < iterations; i++) {
                const picked = rng.weighted(items, (item) => item.weight);
                counts[picked.id]++;
            }

            // Expected ~75% common (3000), ~25% rare (1000)
            const commonRatio = counts.common / iterations;
            expect(commonRatio).toBeGreaterThan(0.7);
            expect(commonRatio).toBeLessThan(0.8);
        });

        it('rejects empty items list', () => {
            const rng = createRng(createSeed(1));
            expect(() => rng.weighted([], () => 1)).toThrow(/empty/);
        });

        it('rejects negative or non-finite weights', () => {
            const rng = createRng(createSeed(1));
            expect(() => rng.weighted(['a', 'b'], (x) => (x === 'a' ? 1 : -1))).toThrow(
                'Randomart: weight of item at index 1 must not be negative, received -1',
            );
            expect(() => rng.weighted(['a', 'b'], (x) => (x === 'a' ? 1 : Number.NaN))).toThrow(
                'Randomart: weight of item at index 1 must be a finite number, received NaN',
            );
        });

        it('rejects total weight <= 0', () => {
            const rng = createRng(createSeed(1));
            expect(() => rng.weighted(['a', 'b'], () => 0)).toThrow(/strictly positive/);
        });
    });
});
