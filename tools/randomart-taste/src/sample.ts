import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { compile } from '@repo/randomart-core/emit';
import type { Compiled } from '@repo/randomart-core/emit';
import { generate } from '@repo/randomart-core/generate';
import { drawGrammar } from '@repo/randomart-core/grammar';
import type { Grammar } from '@repo/randomart-core/grammar';
import { createRng } from '@repo/randomart-core/rng';
import { createSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';

import { featuresOf } from './features';
import type { ExpressionFeatures } from './features';

export interface Sample {
    readonly id: number;
    /** Samples drawn from the same grammar share this id: keep them together when validating. */
    readonly grammarId: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    /** Drawn once per grammar, so seeds of one grammar share the same palette. */
    readonly space: ColorSpaceId;
    readonly shader: Compiled;
    readonly features: ExpressionFeatures;
}

export interface SamplingOptions {
    /** Number of random grammars. */
    readonly grammars: number;
    /** Seeds drawn per grammar. */
    readonly seedsPerGrammar: number;
    /** Seed of the sampling stream itself: the same value replays the same dataset. */
    readonly rngSeed: string;
}

/** Draw random grammars, then several expressions from each, all from one deterministic stream. */
export function drawSamples({ grammars, seedsPerGrammar, rngSeed }: SamplingOptions): Sample[] {
    const rng = createRng(createSeed(rngSeed));
    const samples: Sample[] = [];

    for (let grammarId = 0; grammarId < grammars; grammarId++) {
        const grammar = drawGrammar(rng);
        // Drawn once per grammar so the dataset stays grouped by grammar; the space is a
        // compile-time palette, not part of the grammar.
        const space = rng.pick(COLOR_SPACE_IDS);

        for (let index = 0; index < seedsPerGrammar; index++) {
            const seed = createSeed(String(rng.int(2 ** 31)));
            const expression = generate(grammar, seed);

            samples.push({
                id: samples.length,
                grammarId,
                seed,
                grammar,
                space,
                shader: compile(expression, { space }),
                features: featuresOf(expression, space),
            });
        }
    }

    return samples;
}
