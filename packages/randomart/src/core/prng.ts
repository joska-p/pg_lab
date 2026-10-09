/**
 * A text seed → deterministic stream: FNV-1a folds the UTF-8 bytes into a 32-bit state, mulberry32
 * expands it. Dependency-free yet well-distributed, so the same seed always reproduces the same
 * art.
 */

const textEncoder = new TextEncoder();

function fnv1a(text: string): number {
    let hash = 0x811c9dc5;
    const bytes = textEncoder.encode(text);

    for (const byte of bytes) {
        hash ^= byte;
        hash = Math.imul(hash, 0x01000193);
    }

    return hash >>> 0;
}

export class SeededRandom {
    private state: number;

    constructor(seed: string) {
        // Mix the FNV hash a little so short seeds still spread across the state.
        this.state = (fnv1a(seed) ^ 0x9e3779b9) >>> 0;

        if (this.state === 0) {
            this.state = 0x1;
        }
    }

    next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let t = this.state;

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    nextInt(n: number): number {
        return Math.floor(this.next() * n);
    }

    nextByte(): number {
        return this.nextInt(256);
    }

    nextRange(min: number, max: number): number {
        return min + this.next() * (max - min);
    }
}

/** Tree-shape decisions stay identical across R/G/B while channel values diverge — two streams. */
export interface DualRng {
    structure: SeededRandom;
    channels: [SeededRandom, SeededRandom, SeededRandom];
}

export function createDualRng(seedText: string, maxDepth: number): DualRng {
    return {
        structure: new SeededRandom(`${seedText}_struct_${String(maxDepth)}`),
        channels: [
            new SeededRandom(`${seedText}_red`),
            new SeededRandom(`${seedText}_green`),
            new SeededRandom(`${seedText}_blue`),
        ],
    };
}

export function createCorrelatedRng(seedText: string): DualRng {
    const rng = new SeededRandom(`${seedText}_rgb`);

    return { structure: rng, channels: [rng, rng, rng] };
}

/** Separate mini-LCG, so shuffling never consumes the tree-generation stream. */
export function seededShuffle<T>(arr: readonly T[], seedText: string): T[] {
    const result = [...arr];
    let s = fnv1a(seedText);

    for (let i = result.length - 1; i > 0; i--) {
        s = (Math.imul(s, 1103515245) + 12345) >>> 0;
        const j = s % (i + 1);

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}
