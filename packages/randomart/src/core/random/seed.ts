import { assertIntegerInRange } from '../shared/shared';
import { MAX_SEED } from './constants';
import type { Seed } from './types';

/**
 * `Seed` is identity, not an editing quantity (throw-vs-repair policy in shared/index.ts): an
 * out-of-range value throws instead of being clamped, because a repaired seed is a _different
 * artwork_ — replaying it would silently falsify provenance. Corrupt files are refused honestly at
 * their field path.
 */
export function createSeed(value: number): Seed {
    assertIntegerInRange(value, 'seed', 0, MAX_SEED);

    return value as Seed;
}

export function randomSeed(): Seed {
    // Generation is deterministic. This is one of the only non-deterministic sources (with
    // notebook ids); callers in the UI use it, the generator never does.
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buffer = new Uint32Array(1);
        crypto.getRandomValues(buffer);
        return createSeed(buffer[0]);
    }

    return createSeed(Math.floor(Math.random() * (MAX_SEED + 1)));
}
