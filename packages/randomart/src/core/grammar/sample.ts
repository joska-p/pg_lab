import type { Catalog } from '../catalog/index.ts';
import { RAW_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import { randomGrammar } from './randomGrammar.ts';
import type { Grammar } from './types.ts';

export interface SampledGrammar {
    readonly grammar: Grammar;
    /** Image seeds for this grammar, derived from its index: the whole dataset is deterministic. */
    readonly seeds: readonly Seed[];
}

export interface SampleOptions {
    readonly baseSeed?: number;
    readonly seedsPerGrammar?: number;
    /** Weight scaling amplitude, wider than the UI's default to cover more of the space. */
    readonly spread?: number;
    readonly changeRate?: number;
    /**
     * Channel model of the drawn grammars. Defaults to `RAW_CHANNELS`, the historical dataset draw
     * (three independent trees in sRGB); the gallery passes the app's `DEFAULT_CHANNELS` so its
     * lots are readable the way the play mode is.
     */
    readonly channels?: ChannelModel;
}

/** Golden-ratio multiplicative hash: distinct indices give well-separated 32-bit seeds. */
function deriveSeed(base: number, index: number): Seed {
    return createSeed((Math.imul(index + 1, 0x9e37_79b1) ^ base) >>> 0);
}

/**
 * Independent grammars, not a chained walk: each one starts from the neutral vocabulary and gets
 * its own full randomization (`randomGrammar`), so the sample covers the space instead of drifting
 * through it.
 *
 * Images are rendered at phase 0, where `tsin`/`tcos` are the constants 0 and 1: they flatten
 * subtrees without saying anything about the grammar, so the sampler keeps them off (`includeTime:
 * false`). The channel model defaults to the plain raw sRGB (three independent trees) — the
 * historical dataset draw; callers exploring grammars in-app pass the app's `DEFAULT_CHANNELS`.
 */
export function sampleGrammars(
    catalog: Catalog,
    count: number,
    options: SampleOptions = {},
): SampledGrammar[] {
    const {
        baseSeed = 1,
        seedsPerGrammar = 16,
        spread = 8,
        changeRate = 0.3,
        channels = RAW_CHANNELS,
    } = options;

    const sampled: SampledGrammar[] = [];

    for (let i = 0; i < count; i++) {
        const rng = createRng(deriveSeed(baseSeed, i));
        const grammar = randomGrammar(catalog, rng, {
            spread,
            changeRate,
            channels,
            includeTime: false,
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
