const HISTORY_LIMIT = 1024;

export class SeededRandom {
    private seed: number;
    public readonly initialHash: number;
    public choiceHistory: number[] = [];

    constructor(seedString: string) {
        // A more robust string hashing algorithm (MurmurHash-inspired)
        let hash = 2166136261;

        for (let i = 0; i < seedString.length; i++) {
            hash ^= seedString.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        this.initialHash = Math.abs(hash) || 1;
        this.seed = this.initialHash;
    }

    // Mulberry32 generator: excellent distribution for procedural generation
    next(): number {
        let z = (this.seed += 0x6d2b79f5);

        z = Math.imul(z ^ (z >>> 15), z | 1);
        z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
        const result = ((z ^ (z >>> 14)) >>> 0) / 4294967296;

        if (this.choiceHistory.length < HISTORY_LIMIT) {
            this.choiceHistory.push(result);
        }

        return result;
    }
}
