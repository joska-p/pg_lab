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

        for (let index = 0; index < seedsPerGrammar; index++) {
            const seed = createSeed(String(rng.int(2 ** 31)));
            const expression = generate(grammar, seed);

            samples.push({
                id: samples.length,
                grammarId,
                seed,
                grammar,
                shader: compile(expression, { space: grammar.space }),
                features: featuresOf(expression, grammar.space),
            });
        }
    }

    return samples;
}
