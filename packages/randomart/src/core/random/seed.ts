import { assertFinite, type Brand } from '../shared/index.ts';

export type Seed = Brand<number, 'Seed'>;

export const MAX_SEED = 0xffff_ffff; // 4294967295 (2^32 - 1)

export function createSeed(value: number): Seed {
    assertFinite(value, 'Seed');

    if (!Number.isInteger(value)) {
        throw new Error(`Seed must be an integer, received ${value}`);
    }

    if (value < 0 || value > MAX_SEED) {
        throw new Error(`Seed must be between 0 and ${MAX_SEED}, received ${value}`);
    }

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
