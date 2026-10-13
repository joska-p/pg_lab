import type { Catalog, OperatorDef } from '../catalog/index.ts';
import { assertFinite } from '../shared/index.ts';
import {
    type Constraints,
    type Grammar,
    MAX_DEPTH,
    MAX_NODES,
    MAX_WEIGHT,
    MIN_WEIGHT,
} from './types.ts';

export function minSize(
    d: number,
    minDepth: number,
    vocabularyOperators: readonly OperatorDef[],
): number {
    if (d >= minDepth) {
        return 1;
    }
    const nonTerminals = vocabularyOperators.filter((op) => op.inputs.length > 0);
    if (nonTerminals.length === 0) {
        return 1;
    }
    const k = Math.min(...nonTerminals.map((op) => op.inputs.length));
    return 1 + k * minSize(d + 1, minDepth, vocabularyOperators);
}

export function createGrammar(
    catalog: Catalog,
    {
        weights,
        constraints,
    }: {
        readonly weights: Readonly<Record<string, number>>;
        readonly constraints: Constraints;
    },
): Grammar {
    const opNames = Object.keys(weights);
    if (opNames.length === 0) {
        throw new Error('Grammar weights must not be empty');
    }

    // Rule 1: Every operator exists in catalog
    const vocabOps: OperatorDef[] = [];
    for (const name of opNames) {
        try {
            vocabOps.push(catalog.operator(name));
        } catch {
            throw new Error(`Operator "${name}" does not exist in catalog`);
        }
    }

    // Rule 2: Weights are finite and within [MIN_WEIGHT, MAX_WEIGHT]
    for (const [name, weight] of Object.entries(weights)) {
        assertFinite(weight, `Weight for operator "${name}"`);
        if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
            throw new Error(
                `Weight for operator "${name}" (${weight}) must be within [${MIN_WEIGHT}, ${MAX_WEIGHT}]`,
            );
        }
    }

    // Rule 3: Vocabulary contains at least one terminal
    const terminals = vocabOps.filter((op) => op.inputs.length === 0);
    if (terminals.length === 0) {
        throw new Error('Grammar vocabulary must contain at least one terminal operator');
    }

    // Rule 4: Every input type required by an operator has a matching terminal
    for (const op of vocabOps) {
        for (const input of op.inputs) {
            const hasMatchingTerminal = terminals.some((t) => t.output === input.type);
            if (!hasMatchingTerminal) {
                throw new Error(
                    `Operator "${op.name}" requires input type "${input.type}", but no terminal in vocabulary produces it`,
                );
            }
        }
    }

    // Rule 5: 1 <= minDepth <= maxDepth
    const { minDepth, maxDepth, maxNodes } = constraints;
    if (
        !Number.isInteger(minDepth) ||
        !Number.isInteger(maxDepth) ||
        minDepth < 1 ||
        minDepth > maxDepth
    ) {
        throw new Error(
            `Constraints minDepth (${minDepth}) and maxDepth (${maxDepth}) must be integers satisfying 1 <= minDepth <= maxDepth`,
        );
    }

    // Rule 6: If minDepth > 1, vocabulary must contain at least one non-terminal
    const nonTerminals = vocabOps.filter((op) => op.inputs.length > 0);
    if (minDepth > 1 && nonTerminals.length === 0) {
        throw new Error(
            `minDepth is ${minDepth} (> 1) but vocabulary contains no non-terminal operators`,
        );
    }

    // Rule 7: Hard limits
    if (!Number.isInteger(maxNodes) || maxNodes < 1) {
        throw new Error(`Constraints maxNodes (${maxNodes}) must be an integer >= 1`);
    }
    if (maxDepth > MAX_DEPTH) {
        throw new Error(`maxDepth (${maxDepth}) exceeds hard limit MAX_DEPTH (${MAX_DEPTH})`);
    }
    if (maxNodes > MAX_NODES) {
        throw new Error(`maxNodes (${maxNodes}) exceeds hard limit MAX_NODES (${MAX_NODES})`);
    }

    // Rule 8: Feasibility check: minSize(1) <= maxNodes
    const requiredMinSize = minSize(1, minDepth, vocabOps);
    if (maxNodes < requiredMinSize) {
        throw new Error(
            `Grammar is unfeasible: maxNodes (${maxNodes}) is less than minimum possible size (${requiredMinSize}) for minDepth ${minDepth}`,
        );
    }

    // Freeze and sort weights deterministically
    const sortedWeights: Record<string, number> = {};
    for (const name of [...opNames].sort()) {
        sortedWeights[name] = weights[name];
    }

    return Object.freeze({
        weights: Object.freeze(sortedWeights),
        constraints: Object.freeze({ ...constraints }),
    }) as Grammar;
}

export function staticGrammar(catalog: Catalog): Grammar {
    const weights: Record<string, number> = {
        x: 3,
        y: 3,
        const: 1,
    };

    for (const op of catalog.operators()) {
        if (op.name === 'x' || op.name === 'y' || op.name === 'const') {
            continue;
        }
        if (op.name === 'tsin' || op.name === 'tcos') {
            continue;
        }
        if (op.name === 'select' || op.name === 'mix' || op.name === 'warp') {
            weights[op.name] = 0.5;
        } else {
            weights[op.name] = 1;
        }
    }

    return createGrammar(catalog, {
        weights,
        constraints: {
            minDepth: 3,
            maxDepth: 8,
            maxNodes: 60,
        },
    });
}

export function animatedGrammar(catalog: Catalog): Grammar {
    const staticG = staticGrammar(catalog);
    const weights: Record<string, number> = {
        ...staticG.weights,
        tsin: 1,
        tcos: 1,
    };

    return createGrammar(catalog, {
        weights,
        constraints: staticG.constraints,
    });
}
