import { assertFinite } from '../shared/index.ts';
import type { Seed } from './seed.ts';

export interface Rng {
    readonly next: () => number;
    readonly int: (maxExclusive: number) => number;
    readonly weighted: <T>(items: readonly T[], weightOf: (item: T) => number) => T;
}

export function createRng(seed: Seed): Rng {
    let state = seed | 0;

    function next(): number {
        state = (state + 0x6d2b79f5) | 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function int(maxExclusive: number): number {
        assertFinite(maxExclusive, 'maxExclusive');

        if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
            throw new Error(`maxExclusive must be an integer > 0, received ${maxExclusive}`);
        }

        return Math.floor(next() * maxExclusive);
    }

    function weighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
        if (items.length === 0) {
            throw new Error('weighted: items list must not be empty');
        }

        let total = 0;
        for (let i = 0; i < items.length; i++) {
            const weight = weightOf(items[i]);
            assertFinite(weight, `weight of item at index ${i}`);
            if (weight < 0) {
                throw new Error(
                    `weight of item at index ${i} must be non-negative, received ${weight}`,
                );
            }
            total += weight;
        }

        if (total <= 0) {
            throw new Error(`weighted: total weight must be strictly positive, received ${total}`);
        }

        const r = next() * total;
        let accumulated = 0;

        for (let i = 0; i < items.length; i++) {
            accumulated += weightOf(items[i]);
            if (accumulated > r) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    return {
        next,
        int,
        weighted,
    };
}
