import type { Catalog } from '../catalog/index.ts';
import { DEFAULT_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import { TUNING } from '../config/index.ts';
import type { Rng } from '../random/index.ts';
import { createGrammar } from './grammar.ts';
import { randomizeWeights } from './randomize.ts';
import type { ConstraintsInput, Grammar } from './types.ts';

export interface RandomGrammarOptions {
    /** Weight scaling amplitude, wider than the UI default to cover more of the space. */
    readonly spread?: number;
    /** Probability that each operator toggles on/off. 0 = vocabulary frozen. */
    readonly changeRate?: number;
    /** Channel model of the result. Default: `DEFAULT_CHANNELS` (a shared trunk read as OKLCH). */
    readonly channels?: ChannelModel;
}

/**
 * Raw draws: `createGrammar` repairs them (feasibility, ordering), so they may be extreme. This is
 * the continuous constraint draw of the dataset survey; the app and the bench explore the quantized
 * `TUNING.recipe.sizeProfiles` instead.
 */
function drawConstraints(rng: Rng): ConstraintsInput {
    return {
        minDepth: 1 + rng.int(4), // 1..4
        maxDepth: 4 + rng.int(7), // 4..10
        maxNodes: 20 + rng.int(101), // 20..120 per channel
    };
}

/**
 * A fully random grammar: vocabulary, weights and constraints all drawn at once. It starts from the
 * neutral vocabulary (every operator weight 1) and hands the rest to `randomizeWeights`, so the
 * result is always valid. This is the core of "randomize the grammar itself" — the dataset sampler
 * and the play-mode shuffle are two policies over the same draw.
 */
export function randomGrammar(
    catalog: Catalog,
    rng: Rng,
    options: RandomGrammarOptions = {},
): Grammar {
    const {
        spread = TUNING.sampling.drawSpread,
        changeRate = TUNING.sampling.changeRate,
        channels = DEFAULT_CHANNELS,
    } = options;
    const neutral: Record<string, number> = {};

    for (const operator of catalog.operators()) {
        neutral[operator.name] = 1;
    }

    const start = createGrammar(catalog, {
        weights: neutral,
        constraints: drawConstraints(rng),
        channels,
    });

    return randomizeWeights(catalog, start, rng, { spread, changeRate });
}
