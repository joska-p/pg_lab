import type { Catalog, Operator } from '../catalog/index.ts';
import { CONFIG } from '../config/index.ts';
import type { Rng } from '../random/index.ts';
import {
    createGrammar,
    getVocabulary,
    isNonTerminalOperator,
    isTerminalOperator,
    minSize,
    weightOf,
} from './grammar.ts';
import { MAX_WEIGHT, MIN_ACTIVE_WEIGHT } from './types.ts';
import type { Grammar } from './types.ts';

/** Operators that `randomizeWeights` never switches off: avoids flat, coordinate-free images. */
const DEFAULT_KEEP: readonly string[] = ['x', 'y'];

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

/** 0 stays 0; a positive weight is rounded to 3 decimals and never rounds down to 0. */
function quantize(value: number): number {
    if (value <= 0) {
        return 0;
    }
    return clamp(round3(value), MIN_ACTIVE_WEIGHT, MAX_WEIGHT);
}

function weightShare(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
    terminal: boolean,
): number {
    let total = 0;

    for (const [name, weight] of Object.entries(weights)) {
        if (
            weight !== undefined &&
            weight > 0 &&
            isTerminalOperator(catalog.operator(name)) === terminal
        ) {
            total += weight;
        }
    }

    return total;
}

export interface RandomizeWeightsOptions {
    /** Amplitude: each active weight is multiplied by a log-uniform factor in [1/spread, spread]. */
    readonly spread?: number;
    /** Keeps the terminals' share of the total weight, so expected tree size stays stable. */
    readonly preserveTerminalShare?: boolean;
    /** Probability that each operator toggles on/off (`rng.next() < changeRate`). 0 = vocab fixed. */
    readonly changeRate?: number;
    /** Operators that are never switched off. Pass `[]` to disable. Default: `DEFAULT_KEEP`. */
    readonly keep?: readonly string[];
}

/**
 * Makes the vocabulary usable with the (fixed) constraints: at least one active terminal, at least
 * one active non-terminal when `minDepth > 1`, and feasibility (`minSize(1) ≤ maxNodes`).
 * Feasibility is restored by bringing smaller-arity non-terminals back, which strictly lowers
 * `minSize`.
 */
function repair(
    catalog: Catalog,
    weights: Record<string, number>,
    minDepth: number,
    maxNodes: number,
    rng: Rng,
): void {
    const sorted = [...catalog.operators()].sort((a, b) => byName(a.name, b.name));
    const vocabulary = (): Operator[] => getVocabulary(catalog, weights);

    if (!vocabulary().some(isTerminalOperator)) {
        const terminals = sorted.filter(isTerminalOperator);
        weights[terminals[rng.int(terminals.length)].name] = 1;
    }

    if (minDepth <= 1) {
        return;
    }

    if (!vocabulary().some(isNonTerminalOperator)) {
        const nonTerminals = sorted.filter(isNonTerminalOperator);
        weights[nonTerminals[rng.int(nonTerminals.length)].name] = 1;
    }

    while (minSize(1, minDepth, vocabulary()) > maxNodes) {
        const k = Math.min(
            ...vocabulary()
                .filter(isNonTerminalOperator)
                .map((operator) => operator.arity),
        );
        const candidate = sorted.find(
            (operator) =>
                isNonTerminalOperator(operator) &&
                weights[operator.name] <= 0 &&
                operator.arity < k,
        );

        if (!candidate) {
            break; // The input grammar was already as small as it gets for these constraints.
        }

        weights[candidate.name] = 1;
    }
}

/**
 * Scales the live terminal weights so their share of the total matches the input grammar's share.
 * Called after `repair`, so a live terminal always exists when a non-terminal does.
 */
function preserveTerminalShareOf(
    catalog: Catalog,
    grammar: Grammar,
    weights: Record<string, number>,
    enabled: boolean,
): void {
    if (!enabled) {
        return;
    }

    const terminalBefore = weightShare(catalog, grammar.weights, true);
    const nonTerminalBefore = weightShare(catalog, grammar.weights, false);

    if (nonTerminalBefore <= 0) {
        return;
    }

    const terminalAfter = weightShare(catalog, weights, true);
    const nonTerminalAfter = weightShare(catalog, weights, false);

    if (terminalAfter <= 0 || nonTerminalAfter <= 0) {
        return;
    }

    const share = terminalBefore / (terminalBefore + nonTerminalBefore);
    const terminalScale = (share * nonTerminalAfter) / ((1 - share) * terminalAfter);

    for (const name of Object.keys(weights)) {
        if (weights[name] > 0 && isTerminalOperator(catalog.operator(name))) {
            weights[name] *= terminalScale;
        }
    }
}

/**
 * One exploration of the grammar: weights move, operators switch on and off (a weight of 0 means
 * "not drawn"), constraints are unchanged. Both the scaling and the toggle consume one `rng.next()`
 * per catalog operator, in alphabetical order. Always returns a valid grammar.
 */
export function randomizeWeights(
    catalog: Catalog,
    grammar: Grammar,
    rng: Rng,
    options: RandomizeWeightsOptions = {},
): Grammar {
    const spread = options.spread ?? CONFIG.sampling.exploreSpread;
    const preserveTerminalShare = options.preserveTerminalShare ?? true;
    const changeRate = options.changeRate ?? CONFIG.sampling.changeRate;
    const keep = new Set(options.keep ?? DEFAULT_KEEP);

    if (!Number.isFinite(spread) || spread < 1) {
        throw new Error(
            `Randomart: spread must be a finite number >= 1, received ${String(spread)}`,
        );
    }
    if (!Number.isFinite(changeRate) || changeRate < 0 || changeRate > 1) {
        throw new Error(
            `Randomart: changeRate must be a finite number in [0, 1], received ${changeRate}`,
        );
    }

    const logSpread = Math.log(spread);
    const names = Object.keys(grammar.weights).sort(byName);
    const scaled = new Map<string, number>();

    // Pass 1 — alphabetical order, one rng.next() per operator: log-uniform scaling of live weights.
    for (const name of names) {
        const before = weightOf(grammar.weights, name);
        const factor = Math.exp((2 * rng.next() - 1) * logSpread);

        scaled.set(name, before > 0 ? before * factor : 0);
    }

    // Pass 2 — alphabetical order, one rng.next() per operator: switch off (live → 0) or on (0 → 1).
    const weights: Record<string, number> = {};

    for (const name of names) {
        const before = weightOf(grammar.weights, name);
        const toggles = rng.next() < changeRate;

        if (before > 0) {
            weights[name] = toggles && !keep.has(name) ? 0 : (scaled.get(name) ?? before);
        } else {
            weights[name] = toggles ? 1 : 0;
        }
    }

    repair(catalog, weights, grammar.constraints.minDepth, grammar.constraints.maxNodes, rng);
    preserveTerminalShareOf(catalog, grammar, weights, preserveTerminalShare);

    const quantized: Record<string, number> = {};

    for (const name of names) {
        quantized[name] = quantize(weights[name]);
    }

    return createGrammar(catalog, {
        weights: quantized,
        constraints: grammar.constraints,
        channels: grammar.channels,
    });
}
