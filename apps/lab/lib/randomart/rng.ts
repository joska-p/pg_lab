import { RandomArtError } from './errors';
import type { Seed } from './seed';

export interface Rng {
    /** Uniform draw in [0, 1). */
    next(): number;
    /** Uniform integer in [0, max). */
    int(max: number): number;
    /** Uniform draw of one item; `items` must be non-empty and contain no `undefined`. */
    pick<T>(items: readonly T[]): T;
    /**
     * Draw one item with probability proportional to its weight. Non-positive weights are ignored;
     * when no item has a positive weight, the draw is uniform.
     */
    weighted<T>(items: readonly T[], weightOf: (item: T) => number): T;
}

function xmur3(text: string): () => number {
    let hash = 1779033703 ^ text.length;
    for (let i = 0; i < text.length; i++) {
        hash = Math.imul(hash ^ text.charCodeAt(i), 3432918353);
        hash = (hash << 13) | (hash >>> 19);
    }
    return () => {
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return (hash ^= hash >>> 16) >>> 0;
    };
}

function mulberry32(seed: number): () => number {
    return () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Deterministic stream keyed by a seed. Same seed, same sequence, forever. */
export function createRng(seed: Seed): Rng {
    const next = mulberry32(xmur3(seed)());

    function int(max: number): number {
        if (!Number.isInteger(max) || max <= 0) {
            throw new RandomArtError(`Rng.int: max must be a positive integer, got ${max}`);
        }
        return Math.floor(next() * max);
    }

    function pick<T>(items: readonly T[]): T {
        if (items.length === 0) {
            throw new RandomArtError('Rng.pick: cannot draw from an empty list');
        }

        const item = items[int(items.length)];

        if (item === undefined) {
            throw new RandomArtError('Rng.pick: list must not contain undefined');
        }

        return item;
    }

    function weighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
        let total = 0;
        for (const item of items) {
            const weight = weightOf(item);
            if (weight > 0) {
                total += weight;
            }
        }
        if (total <= 0) {
            return pick(items);
        }
        let remaining = next() * total;
        let last: { readonly item: T } | undefined;
        for (const item of items) {
            const weight = weightOf(item);
            if (weight <= 0) {
                continue;
            }
            last = { item };
            remaining -= weight;
            if (remaining <= 0) {
                return item;
            }
        }
        if (last === undefined) {
            throw new RandomArtError('Rng.weighted: no item has a positive weight');
        }
        return last.item;
    }

    return { next, int, pick, weighted };
}
