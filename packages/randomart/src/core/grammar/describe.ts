import type { Catalog } from '../catalog/index.ts';
import type { Grammar } from './types.ts';

export interface GrammarSummary {
    /** Vocabulary size. */
    readonly operators: number;
    /** Share of the total weight that goes to terminals, in (0, 1]. */
    readonly terminalShare: number;
    /** Weight-averaged arity of the non-terminals (0 if there are none). */
    readonly meanArity: number;
    /**
     * `(1 − terminalShare) × meanArity`: above 1, trees tend to grow until cut by
     * maxDepth/maxNodes.
     */
    readonly growth: number;
    /** True when the vocabulary contains a time terminal (`u_phase`), so images can animate. */
    readonly hasTime: boolean;
}

/** Indicator only (grammar-spec §6), not a rule: lets the UI hint at the "character" of a grammar. */
export function describeGrammar(catalog: Catalog, grammar: Grammar): GrammarSummary {
    let operators = 0;
    let terminalWeight = 0;
    let nonTerminalWeight = 0;
    let arityWeighted = 0;
    let hasTime = false;

    for (const [name, weight] of Object.entries(grammar.weights)) {
        if (weight <= 0) {
            continue;
        }

        const op = catalog.operator(name);
        const arity = op.inputs.length;

        operators++;

        if (op.requires?.includes('u_phase')) {
            hasTime = true;
        }

        if (arity === 0) {
            terminalWeight += weight;
        } else {
            nonTerminalWeight += weight;
            arityWeighted += weight * arity;
        }
    }

    const total = terminalWeight + nonTerminalWeight;
    const terminalShare = total > 0 ? terminalWeight / total : 0;
    const meanArity = nonTerminalWeight > 0 ? arityWeighted / nonTerminalWeight : 0;

    return {
        operators,
        terminalShare,
        meanArity,
        growth: (1 - terminalShare) * meanArity,
        hasTime,
    };
}
