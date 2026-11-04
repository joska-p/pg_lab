import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { createGrammar, MAX_WEIGHT } from '@repo/randomart-core/grammar';
import type { Grammar } from '@repo/randomart-core/grammar';
import type { OpName } from '@repo/randomart-core/ops';

/** Pure grammar transitions: the UI composes them, the store only queues the result. */

export function withWeight(grammar: Grammar, name: OpName, weight: number): Grammar {
    return createGrammar({
        ...grammar,
        weights: { ...grammar.weights, [name]: Math.min(MAX_WEIGHT, Math.max(0, weight)) },
    });
}

export function withMinDepth(grammar: Grammar, minDepth: number): Grammar {
    const maxDepth = Math.max(grammar.maxDepth, minDepth);
    return createGrammar({
        ...grammar,
        minDepth,
        maxDepth,
        shareDepth: Math.min(grammar.shareDepth, maxDepth),
    });
}

export function withMaxDepth(grammar: Grammar, maxDepth: number): Grammar {
    const next = Math.max(grammar.minDepth, maxDepth);
    return createGrammar({
        ...grammar,
        maxDepth: next,
        shareDepth: Math.min(grammar.shareDepth, next),
    });
}

export function withMaxNodes(grammar: Grammar, maxNodes: number): Grammar {
    return createGrammar({ ...grammar, maxNodes });
}

export function withShareDepth(grammar: Grammar, shareDepth: number): Grammar {
    return createGrammar({ ...grammar, shareDepth: Math.min(grammar.maxDepth, shareDepth) });
}

export function withSpace(grammar: Grammar, space: ColorSpaceId): Grammar {
    return createGrammar({ ...grammar, space });
}
