declare const seedBrand: unique symbol;

/**
 * Identity of an artwork: the same seed with the same grammar replays the same expression.
 *
 * Seeds are strings, not numbers. A numeric-looking seed is just a string whose characters happen
 * to be digits, so there is a single representation and one hashing path for every seed. Values are
 * trimmed before they become identity; `'42'` and `' 42 '` are the same artwork.
 */
export type Seed = string & { readonly [seedBrand]: true };

/** Longest accepted seed. Keeps pathological pastes out of the hashing path. */
export const MAX_SEED_LENGTH = 64;

/**
 * Seeds are identity, not an editing quantity: an invalid value throws instead of being repaired,
 * because a repaired seed would describe a different artwork. Text input goes through `parseSeed`.
 */
export function createSeed(value: string): Seed {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > MAX_SEED_LENGTH) {
        throw new RangeError(
            `Seed must be a non-empty string of at most ${MAX_SEED_LENGTH} characters, got "${value}"`,
        );
    }
    return trimmed as Seed;
}

/** Parses raw text into a seed, or `null` when it is empty or too long. */
export function parseSeed(raw: string): Seed | null {
    const trimmed = raw.trim();
    return trimmed === '' || trimmed.length > MAX_SEED_LENGTH ? null : (trimmed as Seed);
}
