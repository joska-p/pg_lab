import type { Rng } from './types';

function xmur3(str: string): () => number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function mulberry32(a: number): () => number {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createRng(seed: number | string): Rng {
    const seedStr = typeof seed === 'number' ? seed.toString() : seed;
    const seedFn = xmur3(seedStr);
    const nextUint = mulberry32(seedFn());
    const next = (): number => nextUint();

    const int = (max: number): number => {
        if (max <= 0) {
            throw new Error(`rng.int: max must be positive, got ${max}`);
        }
        return Math.floor(next() * max);
    };

    const float = (min = 0, max = 1): number => {
        if (max < min) {
            const t = min;
            min = max;
            max = t;
        }
        return min + next() * (max - min);
    };

    const pick = <T>(items: readonly T[]): T => {
        if (items.length === 0) {
            throw new Error('rng.pick: empty array');
        }
        return items[int(items.length)];
    };

    const weighted = <T>(items: readonly T[], weight: (item: T) => number): T => {
        if (items.length === 0) {
            throw new Error('rng.weighted: empty array');
        }
        let total = 0;
        for (const item of items) {
            const w = weight(item);
            if (w > 0) {
                total += w;
            }
        }
        if (total <= 0) {
            return pick(items);
        }
        let r = next() * total;
        for (const item of items) {
            const w = weight(item);
            if (w <= 0) {
                continue;
            }
            r -= w;
            if (r <= 0) {
                return item;
            }
        }
        return items[items.length - 1];
    };

    return { next, int, float, pick, weighted } as Rng;
}
