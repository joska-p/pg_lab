import type { Catalog } from '../catalog/index.ts';
import { RAW_CHANNELS } from '../color/index.ts';
import { CONFIG } from '../config/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import { drawGrammar } from './randomGrammar.ts';
import type { Grammar, SampleOptions } from './types.ts';

export interface SampledGrammar {
    readonly grammar: Grammar;
    /** Image seeds for this grammar, derived from its index: the whole dataset is deterministic. */
    readonly seeds: readonly Seed[];
}

/** Golden-ratio multiplicative hash: distinct indices give well-separated 32-bit seeds. */
export function deriveSeed(base: number, index: number): Seed {
    return createSeed((Math.imul(index + 1, 0x9e37_79b1) ^ base) >>> 0);
}

/**
 * Independent grammars, not a chained walk: each one starts from the neutral vocabulary and gets
 * its own full randomization (`drawGrammar`), so the sample covers the space instead of drifting
 * through it.
 *
 * The channel model defaults to the plain raw sRGB (three independent trees) — the historical
 * dataset draw; callers exploring grammars in-app pass the app's `DEFAULT_CHANNELS`.
 */
export function sampleGrammars(
    catalog: Catalog,
    count: number,
    options: SampleOptions = {},
): SampledGrammar[] {
    const {
        baseSeed = CONFIG.sampling.baseSeed,
        seedsPerGrammar = CONFIG.sampling.datasetSeedsPerGrammar,
        spread = CONFIG.sampling.drawSpread,
        changeRate = CONFIG.sampling.changeRate,
        channels = RAW_CHANNELS,
    } = options;

    const sampled: SampledGrammar[] = [];

    for (let i = 0; i < count; i++) {
        const rng = createRng(deriveSeed(baseSeed, i));
        const grammar = drawGrammar(catalog, rng, {
            spread,
            changeRate,
            channels,
        });

        sampled.push({
            grammar,
            seeds: Array.from({ length: seedsPerGrammar }, (_, k) =>
                deriveSeed(baseSeed ^ 0x5bd1_e995, i * seedsPerGrammar + k),
            ),
        });
    }

    return sampled;
}
