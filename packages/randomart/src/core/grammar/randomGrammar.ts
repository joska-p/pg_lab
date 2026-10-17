import type { Catalog } from '../catalog/index.ts';
import { DEFAULT_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import type { Rng } from '../random/index.ts';
import { createGrammar } from './grammar.ts';
import { randomizeWeights } from './randomize.ts';
import type { ConstraintsInput, Grammar } from './types.ts';

/**
 * Time terminals: at phase 0 they are the constants 0 and 1, so they flatten whole subtrees without
 * saying anything about the grammar. The dataset sampler (which renders at phase 0) keeps them off;
 * the play-mode shuffle may keep them, so an image can animate.
 */
const TIME_OPERATORS: readonly string[] = ['tsin', 'tcos'];

export interface RandomGrammarOptions {
    /** Weight scaling amplitude, wider than the UI default to cover more of the space. */
    readonly spread?: number;
    /** Probability that each operator toggles on/off. 0 = vocabulary frozen. */
    readonly changeRate?: number;
    /** Channel model of the result. Default: `DEFAULT_CHANNELS` (a shared trunk read as OKLCH). */
    readonly channels?: ChannelModel;
    /** Keep `tsin`/`tcos` in the draw. Off for phase-0 datasets. Default: true. */
    readonly includeTime?: boolean;
}

/** Raw draws: `createGrammar` repairs them (feasibility, ordering), so they may be extreme. */
function drawConstraints(rng: Rng): ConstraintsInput {
    return {
        minDepth: 1 + rng.int(4), // 1..4
        maxDepth: 4 + rng.int(7), // 4..10
        maxNodes: 20 + rng.int(101), // 20..120 per channel
    };
}

/**
 * A fully random grammar: vocabulary, weights and constraints all drawn at once. It starts from the
 * neutral vocabulary (every operator weight 1, minus the time terminals when `includeTime` is
 * false) and hands the rest to `randomizeWeights`, so the result is always valid. This is the core
 * of "randomize the grammar itself" (brief §4) — the dataset sampler and the play-mode shuffle are
 * two policies over the same draw.
 */
export function randomGrammar(
    catalog: Catalog,
    rng: Rng,
    options: RandomGrammarOptions = {},
): Grammar {
    const {
        spread = 8,
        changeRate = 0.3,
        channels = DEFAULT_CHANNELS,
        includeTime = true,
    } = options;
    const neutral: Record<string, number> = {};

    for (const operator of catalog.operators()) {
        neutral[operator.name] = !includeTime && TIME_OPERATORS.includes(operator.name) ? 0 : 1;
    }

    const start = createGrammar(catalog, {
        weights: neutral,
        constraints: drawConstraints(rng),
        channels,
    });
    const randomized = randomizeWeights(catalog, start, rng, { spread, changeRate });

    if (includeTime) {
        return randomized;
    }

    // The toggle pass may switch a time operator on (0 → 1): force it back off. `x` and `y` are in
    // `DEFAULT_KEEP`, so a terminal always remains.
    const weights: Record<string, number | undefined> = { ...randomized.weights };

    for (const name of TIME_OPERATORS) {
        if (Object.hasOwn(weights, name)) {
            weights[name] = 0;
        }
    }

    return createGrammar(catalog, {
        weights,
        constraints: randomized.constraints,
        channels,
    });
}
