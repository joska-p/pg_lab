import { assertFinite, assertIntegerInRange } from '../shared/asserts';
import type { Seed } from './types';

const MAX_SEED = 0xffffffff;

export function createSeed(value: number): Seed {
    assertFinite(value, 'seed');
    const int = Math.floor(value);
    assertIntegerInRange(int, 'seed', 0, MAX_SEED);
    return int as Seed;
}

export function seedToNumber(seed: Seed): number {
    return seed as number;
}

export function randomSeed(): Seed {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        const val = buffer[0];
        if (val !== undefined) {
            return createSeed(val);
        }
    }

    return createSeed(Math.floor(Math.random() * (MAX_SEED + 1)));
}
