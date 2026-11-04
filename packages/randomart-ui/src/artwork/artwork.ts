import { compile } from '@repo/randomart-core/emit';
import type { Compiled } from '@repo/randomart-core/emit';
import { generate } from '@repo/randomart-core/generate';
import type { Grammar } from '@repo/randomart-core/grammar';
import type { Seed } from '@repo/randomart-core/seed';
import type { Expression } from '@repo/randomart-core/tree';

/** Everything derived from `(grammar, seed)`. Immutable, so it can be shared freely. */
export interface Artwork {
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly expression: Expression;
    readonly shader: Compiled;
}

/** The editable identity of an artwork: what a queued intent transforms. */
export interface Draft {
    readonly grammar: Grammar;
    readonly seed: Seed;
}

export function buildArtwork(grammar: Grammar, seed: Seed): Artwork {
    const expression = generate(grammar, seed);
    return Object.freeze({
        seed,
        grammar,
        expression,
        shader: compile(expression, { space: grammar.space }),
    });
}

export function draftOf(artwork: Artwork): Draft {
    return { grammar: artwork.grammar, seed: artwork.seed };
}
