import { assertFinite, assertInteger } from '../shared/index.ts';
import type { Seed } from './seed.ts';

export interface Rng {
    readonly next: () => number;
    readonly int: (maxExclusive: number) => number;
    readonly weighted: <T>(items: readonly T[], weightOf: (item: T) => number) => T;
}

/**
 * Draws `int(maxExclusive)` and `weighted` internal helpers (findings F18): their arguments are
 * core-internal values that vouch for themselves, so violations throw instead of being repaired —
 * there is no honest repair for "draw from an empty list" or a zero total (shared/index.ts
 * policy).
 */
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
        assertInteger(maxExclusive, 'maxExclusive');

        if (maxExclusive < 1) {
            throw new Error(
                `Randomart: maxExclusive must be >= 1, received ${String(maxExclusive)}`,
            );
        }

        return Math.floor(next() * maxExclusive);
    }

    function weighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
        if (items.length === 0) {
            throw new Error('Randomart: weighted: the items list must not be empty');
        }

        // Single pass (findings F17): the weights are validated and stored, then reused for the
        // accumulation, so an impure or expensive `weightOf` can no longer desynchronize
        // total-vs-accumulation and silently fall through to `items[last]`.
        const weights: number[] = [];
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            const weight = weightOf(items[i]);
            assertFinite(weight, `weight of item at index ${i}`);
            if (weight < 0) {
                throw new Error(
                    `Randomart: weight of item at index ${i} must not be negative, received ${weight}`,
                );
            }
            weights.push(weight);
            total += weight;
        }

        if (total <= 0) {
            throw new Error(
                `Randomart: weighted: total weight must be strictly positive, received ${total}`,
            );
        }

        const r = next() * total;
        let accumulated = 0;

        for (let i = 0; i < items.length; i++) {
            accumulated += weights[i];
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
