import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { compile } from '@repo/randomart-core/emit';
import type { Compiled } from '@repo/randomart-core/emit';
import { generate } from '@repo/randomart-core/generate';
import { grammarKey } from '@repo/randomart-core/grammar';
import type { Grammar } from '@repo/randomart-core/grammar';
import type { Seed } from '@repo/randomart-core/seed';
import type { Expression } from '@repo/randomart-core/tree';

/** Everything derived from `(grammar, seed, space)`. Immutable, so it can be shared freely. */
export interface Artwork {
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly space: ColorSpaceId;
    readonly expression: Expression;
    readonly shader: Compiled;
}

/** The editable identity of an artwork: what a queued intent transforms. */
export interface Draft {
    readonly grammar: Grammar;
    readonly seed: Seed;
    readonly space: ColorSpaceId;
}

export function buildArtwork(grammar: Grammar, seed: Seed, space: ColorSpaceId): Artwork {
    const expression = generate(grammar, seed);
    return Object.freeze({
        seed,
        grammar,
        space,
        expression,
        shader: compile(expression, { space }),
    });
}

/**
 * Recompile an existing artwork for another color space without regenerating its expression.
 * Generation depends only on `(grammar, seed)`, so the formula is unchanged.
 */
export function recompileArtwork(artwork: Artwork, space: ColorSpaceId): Artwork {
    return Object.freeze({
        seed: artwork.seed,
        grammar: artwork.grammar,
        space,
        expression: artwork.expression,
        shader: compile(artwork.expression, { space }),
    });
}

export function draftOf(artwork: Artwork): Draft {
    return { grammar: artwork.grammar, seed: artwork.seed, space: artwork.space };
}

/** Two drafts describe the same artwork when their seeds, grammars and spaces match. */
export function isSameDraft(a: Draft, b: Draft): boolean {
    return (
        a.seed === b.seed && a.space === b.space && grammarKey(a.grammar) === grammarKey(b.grammar)
    );
}
