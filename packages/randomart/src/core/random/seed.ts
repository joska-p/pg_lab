import { assertIntegerInRange } from '../shared/index.ts';
import type { Brand } from '../shared/index.ts';

export type Seed = Brand<number, 'Seed'>;

export const MAX_SEED = 0xffff_ffff; // 4294967295 (2^32 - 1)

export function createSeed(value: number): Seed {
    assertIntegerInRange(value, 'seed', 0, MAX_SEED);

    return value as Seed;
}

export function randomSeed(): Seed {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return createSeed(buffer[0]);
    }

    return createSeed(Math.floor(Math.random() * (MAX_SEED + 1)));
}
