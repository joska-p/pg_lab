import { createSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';

/** The only source of ambient randomness in the UI; the generator itself stays deterministic. */
export function randomSeed(): Seed {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return createSeed(String(buffer[0]));
    }

    return createSeed(String(Math.floor(Math.random() * 0x100000000)));
}
