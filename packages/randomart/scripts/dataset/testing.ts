import type { Dataset, DatasetGrammar } from './loadDataset.ts';

/**
 * Deterministic in-memory dataset for tests: image (g, k) is filled with the byte `(g * 16 + k) &
 * 0xff`, so an assertion can name the pixel it expects.
 */
export function fakeDataset(options?: {
    readonly count?: number;
    readonly seeds?: number;
    readonly size?: number;
}): Dataset {
    const { count = 3, seeds = 5, size = 16 } = options ?? {};
    const grammars: DatasetGrammar[] = Array.from({ length: count }, (_, g) => ({
        grammar: { weights: { [`op${g}`]: 1 }, constraints: { minDepth: g } },
        seeds: Array.from({ length: seeds }, (_, k) => g * 16 + k),
        ok: Array.from({ length: seeds }, () => true),
    }));

    return {
        size,
        seedsPerGrammar: seeds,
        generatorVersion: 1,
        grammars,
        image(grammarIndex, seedIndex) {
            return {
                width: size,
                height: size,
                rgb: new Uint8Array(size * size * 3).fill((grammarIndex * 16 + seedIndex) & 0xff),
            };
        },
    };
}
