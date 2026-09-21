export interface SeededRandom {
    next: () => number;
    pick: <T>(arr: readonly T[]) => T;
    pickWeighted: <T extends { weight?: number }>(arr: readonly T[]) => T;
    range: (min: number, max: number, precision?: number) => string;
    /** Raw draws from `next()`, for debugging/replay. */
    readonly rollHistory: readonly number[];
    readonly initialHash: number;
}

const HISTORY_LIMIT = 1024;

/**
 * Prefer over the `!` operator: same narrowing, but fails loudly at runtime if the assumption was
 * wrong.
 */
function assertDefined<T>(value: T | undefined, message = 'Expected value to be defined'): T {
    if (value === undefined) throw new Error(message);

    return value;
}

/** FNV-1a style hash, folded to a positive 32-bit int (never 0). */
function hashSeed(seedString: string): number {
    let hash = 2166136261;

    for (let i = 0; i < seedString.length; i++) {
        hash ^= seedString.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return Math.abs(hash) || 1;
}

/**
 * Mulberry32 PRNG step. Deterministic, fast, good enough distribution for
 * gameplay/procedural-generation use cases (not cryptographically secure).
 */
function mulberry32Step(state: number): { value: number; nextState: number } {
    const nextState = (state + 0x6d2b79f5) | 0;
    let z = nextState;

    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    const value = ((z ^ (z >>> 14)) >>> 0) / 4294967296;

    return { value, nextState };
}

export function createSeededRandom(seedString: string): SeededRandom {
    const initialHash = hashSeed(seedString);
    let seed = initialHash;
    const rollHistory: number[] = [];

    const next = (): number => {
        const { value, nextState } = mulberry32Step(seed);

        seed = nextState;

        if (rollHistory.length < HISTORY_LIMIT) {
            rollHistory.push(value);
        }

        return value;
    };

    const pick = <T>(arr: readonly T[]): T => {
        if (arr.length === 0) throw new Error('Cannot pick from empty array!');

        const index = Math.floor(next() * arr.length);

        // Safe: index is derived from Math.floor(next() * arr.length) with
        // next() in [0, 1), so 0 <= index < arr.length is guaranteed.
        return assertDefined(arr[index]);
    };

    const pickWeighted = <T extends { weight?: number }>(arr: readonly T[]): T => {
        if (arr.length === 0) throw new Error('Cannot pick from empty array!');

        const totalWeight = arr.reduce((sum, item) => sum + (item.weight ?? 1), 0);
        let target = next() * totalWeight;

        // Floating-point rounding can leave `target` just above 0 at the end of the loop.
        for (const item of arr) {
            target -= item.weight ?? 1;

            if (target <= 0) return item;
        }

        // Guaranteed non-empty by the check above.
        return assertDefined(arr[arr.length - 1]);
    };

    const range = (min: number, max: number, precision = 3): string => {
        const val = next() * (max - min) + min;

        return val.toFixed(precision);
    };

    return {
        next,
        pick,
        pickWeighted,
        range,
        get rollHistory() {
            return rollHistory;
        },
        initialHash,
    };
}
