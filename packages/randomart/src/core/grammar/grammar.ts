import type { Catalog, OperatorDef } from '../catalog';
import { assertFinite } from '../shared';
import { MAX_DEPTH, MAX_NODES, MAX_WEIGHT, MIN_WEIGHT } from './types';
import type { Constraints, Grammar } from './types';

export const isTerminalOp = (op: OperatorDef): boolean => op.inputs.length === 0;
export const isNonTerminalOp = (op: OperatorDef): boolean => op.inputs.length > 0;

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

/**
 * The vocabulary of a grammar: the operators it may draw, i.e. those with a strictly positive
 * weight, by alphabetical name. A weight of 0 means the operator is off.
 */
export function activeOperators(
    catalog: Catalog,
    weights: Readonly<Record<string, number>>,
): OperatorDef[] {
    return Object.keys(weights)
        .sort()
        .map((name) => catalog.operator(name))
        .filter((op) => weights[op.name] > 0);
}

/**
 * Keeps constraints usable for a given vocabulary: integers within the hard limits, `1 ≤ minDepth ≤
 * maxDepth`, and feasible (`minSize(1, minDepth) ≤ maxNodes`). Used by the UI, which edits
 * constraints by hand instead of randomizing them. Lowering `maxNodes` first, then `minDepth` down
 * to 1, always terminates since `minDepth = 1` is feasible.
 */
export function fitConstraints(
    vocabularyOperators: readonly OperatorDef[],
    constraints: Constraints,
): Constraints {
    const clampInt = (value: number, min: number, max: number): number =>
        Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;

    let minDepth = clampInt(constraints.minDepth, 1, MAX_DEPTH);
    const maxDepth = clampInt(constraints.maxDepth, minDepth, MAX_DEPTH);

    // The user may drag maxDepth below minDepth: keep maxDepth and bring minDepth along.
    minDepth = Math.min(minDepth, maxDepth);

    if (minDepth > 1 && !vocabularyOperators.some(isNonTerminalOp)) {
        minDepth = 1;
    }

    let maxNodes = clampInt(constraints.maxNodes, 1, MAX_NODES);
    const needed = (): number => minSize(1, minDepth, vocabularyOperators);

    if (needed() > maxNodes) {
        maxNodes = Math.min(MAX_NODES, needed());
    }

    while (minDepth > 1 && minSize(1, minDepth, vocabularyOperators) > maxNodes) {
        minDepth--;
    }

    return { minDepth, maxDepth, maxNodes };
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

    // The vocabulary: what the generator may draw. A weight of 0 switches the operator off.
    const vocabulary = vocabOps.filter((op) => weights[op.name] > 0);

    // Rule 3: Vocabulary contains at least one active terminal
    const terminals = vocabulary.filter(isTerminalOp);
    if (terminals.length === 0) {
        throw new Error('Grammar vocabulary must contain at least one terminal operator');
    }

    // Rule 4: Every input type required by an active operator has a matching active terminal
    for (const op of vocabulary) {
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

    // Rule 6: If minDepth > 1, vocabulary must contain at least one active non-terminal
    const nonTerminals = vocabulary.filter(isNonTerminalOp);
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

    // Rule 8: Feasibility check: minSize(1) <= maxNodes, over the active vocabulary
    const requiredMinSize = minSize(1, minDepth, vocabulary);
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

/**
 * The default vocabulary: the whole catalog, with spatial terminals favoured and the expensive
 * combinators down-weighted. Time terminals (`tsin`, `tcos`) are ordinary members of the catalog,
 * so there is no separate "animated" preset: one seed gives one expression, and animation is a
 * matter of playback.
 */
export function defaultGrammar(catalog: Catalog): Grammar {
    const weights: Record<string, number> = {
        x: 3,
        y: 3,
        const: 1,
    };

    for (const op of catalog.operators()) {
        if (op.name === 'x' || op.name === 'y' || op.name === 'const') {
            continue;
        }
        weights[op.name] =
            op.name === 'select' || op.name === 'mix' || op.name === 'warp' ? 0.5 : 1;
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
