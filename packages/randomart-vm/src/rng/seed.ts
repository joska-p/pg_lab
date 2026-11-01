import { assertFinite, assertIntegerInRange } from '../shared/asserts';
import type { Seed } from './types';

export function createSeed(value: number): Seed {
    assertFinite(value, 'seed');
    const int = Math.floor(value);
    assertIntegerInRange(int, 'seed', 0, 0xffffffff);
    return int as Seed;
}

export function seedToNumber(seed: Seed): number {
    return seed as number;
}
