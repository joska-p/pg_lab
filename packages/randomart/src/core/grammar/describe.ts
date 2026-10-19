import type { Catalog } from '../catalog/index.ts';
import type { Grammar, GrammarSummary } from './types.ts';

/** Indicator only, not a rule: lets the UI hint at the "character" of a grammar. */
export function describeGrammar(catalog: Catalog, grammar: Grammar): GrammarSummary {
    let vocabularySize = 0;
    let terminalWeight = 0;
    let nonTerminalWeight = 0;
    let arityWeighted = 0;

    for (const [name, weight] of Object.entries(grammar.weights)) {
        if (weight === undefined || weight <= 0) {
            continue;
        }

        const operator = catalog.operator(name);
        const arity = operator.arity;

        vocabularySize++;

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
        vocabularySize,
        terminalShare,
        meanArity,
        growth: (1 - terminalShare) * meanArity,
    };
}
