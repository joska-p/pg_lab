import {
    createGrammar,
    MAX_WEIGHT,
    maxFeasibleMinDepth,
    minimumNodes,
} from '@repo/randomart-core/grammar';
import type { Grammar } from '@repo/randomart-core/grammar';
import type { OpName } from '@repo/randomart-core/ops';

/**
 * Pure grammar transitions. These are the only functions that adjust neighbouring values to keep a
 * grammar valid; createGrammar itself never repairs.
 */

export function withWeight(grammar: Grammar, name: OpName, weight: number): Grammar {
    const weights = { ...grammar.weights, [name]: Math.min(MAX_WEIGHT, Math.max(0, weight)) };
    const minDepth = maxFeasibleMinDepth({ ...grammar, weights }, grammar.minDepth);
    return createGrammar({ ...grammar, weights, minDepth });
}

export function withMinDepth(grammar: Grammar, minDepth: number): Grammar {
    const feasible = maxFeasibleMinDepth(grammar, minDepth);
    const maxDepth = Math.max(grammar.maxDepth, feasible);
    return createGrammar({
        ...grammar,
        minDepth: feasible,
        maxDepth,
        shareDepth: Math.min(grammar.shareDepth, maxDepth),
    });
}

export function withMaxDepth(grammar: Grammar, maxDepth: number): Grammar {
    return createGrammar({
        ...grammar,
        minDepth: Math.min(grammar.minDepth, maxDepth),
        maxDepth,
        shareDepth: Math.min(grammar.shareDepth, maxDepth),
    });
}

export function withMaxNodes(grammar: Grammar, maxNodes: number): Grammar {
    return createGrammar({ ...grammar, maxNodes: Math.max(maxNodes, minimumNodes(grammar)) });
}

export function withShareDepth(grammar: Grammar, shareDepth: number): Grammar {
    return createGrammar({ ...grammar, shareDepth: Math.min(grammar.maxDepth, shareDepth) });
}
