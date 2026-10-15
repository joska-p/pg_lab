import type { Catalog, OperatorDef } from '../catalog/index.ts';
import type { Rng } from '../random/index.ts';
import { createGrammar, minSize } from './grammar.ts';
import {
    type Constraints,
    type Grammar,
    MAX_DEPTH,
    MAX_NODES,
    MAX_WEIGHT,
    MIN_WEIGHT,
} from './types.ts';

/** Operators that `randomizeVocabulary` never removes: avoids flat, coordinate-free images (D39). */
export const DEFAULT_KEEP: readonly string[] = ['x', 'y'];

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

function byName(a: string, b: string): number {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

const isTerminalOp = (op: OperatorDef): boolean => op.inputs.length === 0;
const isNonTerminalOp = (op: OperatorDef): boolean => op.inputs.length > 0;

function vocabularyOf(catalog: Catalog, weights: Readonly<Record<string, number>>): OperatorDef[] {
    return Object.keys(weights).map((name) => catalog.operator(name));
}

function isFeasible(
    catalog: Catalog,
    weights: Readonly<Record<string, number>>,
    constraints: Constraints,
): boolean {
    const ops = vocabularyOf(catalog, weights);
    return minSize(1, constraints.minDepth, ops) <= constraints.maxNodes;
}

// ---------------------------------------------------------------------------
// randomizeWeights — "nouvelle distribution"
// ---------------------------------------------------------------------------

export interface RandomizeWeightsOptions {
    /** Amplitude: each weight is multiplied by a log-uniform factor in [1/spread, spread]. */
    readonly spread?: number;
    /** Keeps the terminals' share of the total weight, so expected tree size stays stable. */
    readonly preserveTerminalShare?: boolean;
}

/** Vocabulary and constraints are unchanged; only the weights move. Always returns a valid grammar. */
export function randomizeWeights(
    catalog: Catalog,
    grammar: Grammar,
    rng: Rng,
    options: RandomizeWeightsOptions = {},
): Grammar {
    const spread = options.spread ?? 4;
    const preserveTerminalShare = options.preserveTerminalShare ?? true;

    if (!Number.isFinite(spread) || spread < 1) {
        throw new Error(`spread must be a finite number >= 1, received ${String(spread)}`);
    }

    const logSpread = Math.log(spread);
    const names = Object.keys(grammar.weights).sort(byName);
    const scaled = new Map<string, number>();
    let terminalBefore = 0;
    let nonTerminalBefore = 0;
    let terminalAfter = 0;
    let nonTerminalAfter = 0;

    // Alphabetical order, exactly one rng.next() per weight (D33).
    for (const name of names) {
        const before = grammar.weights[name];
        const after = before * Math.exp((2 * rng.next() - 1) * logSpread);

        scaled.set(name, after);

        if (isTerminalOp(catalog.operator(name))) {
            terminalBefore += before;
            terminalAfter += after;
        } else {
            nonTerminalBefore += before;
            nonTerminalAfter += after;
        }
    }

    // A valid grammar always has a terminal, so `share` is in (0, 1) as soon as a non-terminal exists.
    let terminalScale = 1;

    if (preserveTerminalShare && nonTerminalBefore > 0) {
        const share = terminalBefore / (terminalBefore + nonTerminalBefore);

        terminalScale = (share * nonTerminalAfter) / ((1 - share) * terminalAfter);
    }

    const weights: Record<string, number> = {};

    for (const name of names) {
        const factor = isTerminalOp(catalog.operator(name)) ? terminalScale : 1;

        weights[name] = clamp(round3((scaled.get(name) ?? 0) * factor), MIN_WEIGHT, MAX_WEIGHT);
    }

    return createGrammar(catalog, { weights, constraints: grammar.constraints });
}

// ---------------------------------------------------------------------------
// randomizeVocabulary — "nouveau vocabulaire"
// ---------------------------------------------------------------------------

export interface RandomizeVocabularyOptions {
    /** Probability that each catalog operator toggles in/out of the vocabulary. */
    readonly changeRate?: number;
    /** Operators that never leave the vocabulary. Pass `[]` to disable. */
    readonly keep?: readonly string[];
}

/**
 * Constraints are unchanged; surviving operators keep their weight, entering ones get 1. Repairs
 * the vocabulary (terminal, non-terminal, feasibility); if no repair is possible the input grammar
 * is returned unchanged rather than throwing.
 */
export function randomizeVocabulary(
    catalog: Catalog,
    grammar: Grammar,
    rng: Rng,
    options: RandomizeVocabularyOptions = {},
): Grammar {
    const changeRate = options.changeRate ?? 0.3;
    const keep = new Set(options.keep ?? DEFAULT_KEEP);
    const weights: Record<string, number> = { ...grammar.weights };
    const sorted = [...catalog.operators()].sort((a, b) => byName(a.name, b.name));

    // Alphabetical order, exactly one rng.next() per catalog operator.
    for (const op of sorted) {
        if (rng.next() >= changeRate) {
            continue;
        }

        if (op.name in weights) {
            if (!keep.has(op.name)) {
                delete weights[op.name];
            }
        } else {
            weights[op.name] = 1;
        }
    }

    repairVocabulary(catalog, weights, grammar.constraints, rng, sorted);

    const ops = vocabularyOf(catalog, weights);
    const usable =
        ops.some(isTerminalOp) &&
        (grammar.constraints.minDepth === 1 || ops.some(isNonTerminalOp)) &&
        isFeasible(catalog, weights, grammar.constraints);

    if (!usable) {
        return grammar;
    }

    return createGrammar(catalog, { weights, constraints: grammar.constraints });
}

function repairVocabulary(
    catalog: Catalog,
    weights: Record<string, number>,
    constraints: Constraints,
    rng: Rng,
    sorted: readonly OperatorDef[],
): void {
    const terminals = sorted.filter(isTerminalOp);

    if (!vocabularyOf(catalog, weights).some(isTerminalOp) && terminals.length > 0) {
        weights[terminals[rng.int(terminals.length)].name] = 1;
    }

    if (constraints.minDepth <= 1) {
        return;
    }

    const nonTerminals = sorted.filter(isNonTerminalOp);

    if (nonTerminals.length === 0) {
        return;
    }

    if (!vocabularyOf(catalog, weights).some(isNonTerminalOp)) {
        weights[nonTerminals[rng.int(nonTerminals.length)].name] = 1;
    }

    // Removing the low-arity operators raises minSize: bring the smallest one back if needed.
    if (!isFeasible(catalog, weights, constraints)) {
        const smallest = Math.min(...nonTerminals.map((op) => op.inputs.length));
        const candidate = nonTerminals.find(
            (op) => op.inputs.length === smallest && !(op.name in weights),
        );

        if (candidate) {
            weights[candidate.name] = 1;
        }
    }
}

// ---------------------------------------------------------------------------
// randomizeGrammar — "nouvelle grammaire"
// ---------------------------------------------------------------------------

export interface RandomizeGrammarOptions {
    /** Which dimensions vary; all three by default. */
    readonly dimensions?: {
        readonly vocabulary?: boolean;
        readonly weights?: boolean;
        readonly constraints?: boolean;
    };
    readonly vocabulary?: RandomizeVocabularyOptions;
    readonly weights?: RandomizeWeightsOptions;
}

/** Fixed order: vocabulary, weights, constraints. The result always passes `createGrammar`. */
export function randomizeGrammar(
    catalog: Catalog,
    grammar: Grammar,
    rng: Rng,
    options: RandomizeGrammarOptions = {},
): Grammar {
    const dimensions = options.dimensions ?? {};
    let current = grammar;

    if (dimensions.vocabulary ?? true) {
        current = randomizeVocabulary(catalog, current, rng, options.vocabulary);
    }

    if (dimensions.weights ?? true) {
        current = randomizeWeights(catalog, current, rng, options.weights);
    }

    if (dimensions.constraints ?? true) {
        current = createGrammar(catalog, {
            weights: current.weights,
            constraints: randomizeConstraints(catalog, current, rng),
        });
    }

    return current;
}

function randomizeConstraints(catalog: Catalog, grammar: Grammar, rng: Rng): Constraints {
    // Integer in [-span, +span].
    const delta = (span: number): number => Math.floor(rng.next() * (2 * span + 1)) - span;
    const { minDepth, maxDepth, maxNodes } = grammar.constraints;

    const nextMaxDepth = clamp(maxDepth + delta(2), 1, MAX_DEPTH);
    const nextMinDepth = Math.min(Math.max(1, minDepth + delta(1)), nextMaxDepth);
    // ±50 %
    const nextMaxNodes = clamp(Math.round(maxNodes * (0.5 + rng.next())), 1, MAX_NODES);

    return repairConstraints(vocabularyOf(catalog, grammar.weights), {
        minDepth: nextMinDepth,
        maxDepth: nextMaxDepth,
        maxNodes: nextMaxNodes,
    });
}

/**
 * Makes constraints feasible: raise maxNodes first, then lower minDepth (minDepth = 1 always
 * works).
 */
function repairConstraints(ops: readonly OperatorDef[], constraints: Constraints): Constraints {
    let { minDepth } = constraints;
    let { maxNodes } = constraints;

    if (!ops.some(isNonTerminalOp)) {
        minDepth = 1;
    }

    const needed = minSize(1, minDepth, ops);

    if (needed > maxNodes) {
        maxNodes = Math.min(MAX_NODES, needed);
    }

    while (minDepth > 1 && minSize(1, minDepth, ops) > maxNodes) {
        minDepth--;
    }

    return { minDepth, maxDepth: constraints.maxDepth, maxNodes };
}
