export const MAX_SEED = 0xffffffff;

declare const seedBrand: unique symbol;

/** Identity of an artwork: the same seed with the same grammar replays the same expression. */
export type Seed = number & { readonly [seedBrand]: true };

/**
 * Seeds are identity, not an editing quantity: an out-of-range value throws instead of being
 * clamped, because a repaired seed would describe a different artwork. Text input is validated
 * before it reaches this function.
 */
export function createSeed(value: number): Seed {
    if (!Number.isInteger(value) || value < 0 || value > MAX_SEED) {
        throw new RangeError(`Seed must be an integer in [0, ${MAX_SEED}], got ${value}`);
    }
    return value as Seed;
}

/** The only source of ambient randomness in the UI; the generator itself stays deterministic. */
export function randomSeed(): Seed {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return createSeed(buffer[0]);
    }

    return createSeed(Math.floor(Math.random() * (MAX_SEED + 1)));
}
