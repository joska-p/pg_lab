export function mulberry32(seed: number): () => number {
    return function random(): number {
        let t = (seed += 0x6d2b79f5);

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function hashString(str: string): number {
    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

export function hashHex(seed: number): string {
    return (seed >>> 0).toString(16).padStart(8, '0');
}

export function toSeed(input: string | number): number {
    return typeof input === 'number' ? input >>> 0 : hashString(input);
}

export function randInt(rand: () => number, min: number, max: number): number {
    return min + Math.floor(rand() * (max - min + 1));
}

export function randRange(rand: () => number, min: number, max: number): number {
    return min + rand() * (max - min);
}

export function pick<T>(rand: () => number, array: readonly T[]): T {
    const index = Math.floor(rand() * array.length);
    const item = array[index];

    if (item === undefined) {
        throw new Error('Cannot pick from an empty array');
    }

    return item;
}

const STYLE_SEED_STEP = 0x9e3779b9;

export function graphicSeed(seed: number, styleIndex: number): number {
    return (seed + styleIndex * STYLE_SEED_STEP) >>> 0;
}
