import type { Catalog } from '../catalog/index.ts';
import { CONFIG } from '../config/index.ts';
import { createRng } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import { deriveSeed, drawGrammar, grammarKey, itemSeeds } from './quantized.ts';
import type { Grammar, SampleOptions } from './types.ts';

export interface SampledGrammar {
    readonly grammar: Grammar;
    /** Image seeds for this grammar, derived from its index: the whole sample is deterministic. */
    readonly seeds: readonly Seed[];
}

const MAX_DEDUPE_ATTEMPTS = 50;

/**
 * Independent grammars, not a chained walk: each one is its own `drawGrammar` from the same base
 * seed, so the sample covers the space instead of drifting through it. The dataset and the bench
 * share this single sampler; callers may pin a grammar axis (`size`, `shareDepth`, `space`).
 */
export function sampleGrammars(
    catalog: Catalog,
    count: number,
    options: SampleOptions = {},
): SampledGrammar[] {
    const {
        baseSeed = CONFIG.sampling.baseSeed,
        seedsPerGrammar = CONFIG.sampling.datasetSeedsPerGrammar,
        ...pins
    } = options;
    const seen = new Set<string>();
    const sampled: SampledGrammar[] = [];

    for (let i = 0; i < count; i++) {
        const rng = createRng(deriveSeed(baseSeed, i));
        let grammar = drawGrammar(catalog, rng, pins);

        for (
            let attempt = 0;
            seen.has(grammarKey(catalog, grammar)) && attempt < MAX_DEDUPE_ATTEMPTS;
            attempt++
        ) {
            grammar = drawGrammar(catalog, rng, pins);
        }

        seen.add(grammarKey(catalog, grammar));
        sampled.push({
            grammar,
            seeds: itemSeeds(baseSeed, i, seedsPerGrammar),
        });
    }

    return sampled;
}
