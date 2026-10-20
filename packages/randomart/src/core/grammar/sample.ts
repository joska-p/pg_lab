import type { Catalog } from '../catalog/index.ts';
import { RAW_CHANNELS } from '../color/index.ts';
import { CONFIG } from '../config/index.ts';
import { createRng } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import { deriveSeed, drawRecipe, itemSeeds, recipeToGrammar, SHARE_CHOICES } from './quantized.ts';
import type { Grammar, SampleOptions, ShareChoice } from './types.ts';

export interface SampledGrammar {
    readonly grammar: Grammar;
    /** Image seeds for this grammar, derived from its index: the whole dataset is deterministic. */
    readonly seeds: readonly Seed[];
}

/**
 * Independent grammars, not a chained walk: each one is its own draw of the recipe grid (the family
 * prior of `drawRecipe`), so the sample covers the space instead of drifting through it.
 *
 * The channel model becomes the pinned recipe axes — the default `RAW_CHANNELS` reads as "share 0
 * in sRGB" (three independent trees), the historical dataset draw; callers exploring grammars
 * in-app pass the app's `DEFAULT_CHANNELS` ("share 2 read as OKLCH").
 */
export function sampleGrammars(
    catalog: Catalog,
    count: number,
    options: SampleOptions = {},
): SampledGrammar[] {
    const {
        baseSeed = CONFIG.sampling.baseSeed,
        seedsPerGrammar = CONFIG.sampling.datasetSeedsPerGrammar,
        channels = RAW_CHANNELS,
    } = options;

    const sampled: SampledGrammar[] = [];
    // A channel shareDepth is a plain number; on the recipe axis it reads as the matching notch
    // (anything beyond the notches is a fully shared trunk, i.e. 'mono').
    const share: ShareChoice =
        SHARE_CHOICES.find((choice) => choice === channels.shareDepth) ?? 'mono';

    for (let i = 0; i < count; i++) {
        const rng = createRng(deriveSeed(baseSeed, i));
        const recipe = drawRecipe(rng, { share, space: channels.space });

        sampled.push({
            grammar: recipeToGrammar(catalog, recipe),
            seeds: itemSeeds(baseSeed, i, seedsPerGrammar),
        });
    }

    return sampled;
}
