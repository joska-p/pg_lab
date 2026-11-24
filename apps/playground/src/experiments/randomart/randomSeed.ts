import { createSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';

/** The only source of ambient randomness in the UI; the generator itself stays deterministic. */
export function randomSeed(): Seed {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const [value] = crypto.getRandomValues(new Uint32Array(1));
        if (value !== undefined) {
            return createSeed(String(value));
        }
    }

    return createSeed(String(Math.floor(Math.random() * 0x100000000)));
}
