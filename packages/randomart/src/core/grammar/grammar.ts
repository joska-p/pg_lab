import type { Catalog, Operator, OperatorId } from '../catalog/index.ts';
import { isColorSpaceId, MIN_SHARE_DEPTH } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import { CONFIG, isSizeProfileId } from '../config/index.ts';
import type { SizeProfileId, Constraints } from '../config/index.ts';
import { assertIntegerInRange } from '../shared/index.ts';
import type { Grammar } from './types.ts';

export const isTerminalOperator = (operator: Operator): boolean => operator.isTerminal;
export const isNonTerminalOperator = (operator: Operator): boolean => !operator.isTerminal;

/**
 * Reads a weight by name with the grammar's own convention: an absent entry (or an explicit
 * `undefined`) means "off", i.e. 0. The single reader every consumer shares, so `GrammarWeights`
 * (partial, id-keyed) never has to be narrowed ad hoc.
 */
export function weightOf(
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): number {
    return weights[name] ?? 0;
}

/** The depth/node budget of a size profile — the only way to constraints. */
export function constraintsOf(size: SizeProfileId): Constraints {
    return CONFIG.grammar.sizeProfiles[size];
}

/** The channel model a grammar implies: the color space and the shared-trunk depth. */
export function channelModelOf(grammar: Grammar): ChannelModel {
    return { space: grammar.space, shareDepth: grammar.shareDepth };
}

export function minSize(
    currentDepth: number,
    minDepth: number,
    operators: readonly Operator[],
): number {
    if (currentDepth >= minDepth) {
        return 1;
    }
    const nonTerminals = operators.filter(isNonTerminalOperator);
    if (nonTerminals.length === 0) {
        return 1;
    }
    const k = Math.min(...nonTerminals.map((operator) => operator.arity));
    return 1 + k * minSize(currentDepth + 1, minDepth, operators);
}

/**
 * The vocabulary of a grammar: the operators it may draw, i.e. those with a strictly positive
 * weight, by alphabetical name. A weight of 0 means the operator is off.
 */
export function getVocabulary(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
): Operator[] {
    return Object.keys(weights)
        .sort()
        .map((name) => catalog.operator(name))
        .filter((operator) => weightOf(weights, operator.name) > 0);
}

function isLastOfKind(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
    isKind: (operator: Operator) => boolean,
): boolean {
    if (weightOf(weights, name) <= 0) {
        return false;
    }

    return getVocabulary(catalog, weights).filter(isKind).length === 1;
}

/**
 * True when switching `name` off would empty the terminals — the generator could no longer finish a
 * tree, so `createGrammar` refuses the gesture. A derived reading of `weights`, never a stored
 * flag: the UI uses it to disable a control that has no valid outcome.
 */
export function isLastTerminal(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): boolean {
    return isLastOfKind(catalog, weights, name, isTerminalOperator);
}

/**
 * True when switching `name` off would empty the non-terminals — every size profile has `minDepth >
 * 1`, so a terminal-only vocabulary cannot grow a tree.
 */
export function isLastNonTerminal(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): boolean {
    return isLastOfKind(catalog, weights, name, isNonTerminalOperator);
}

/**
 * Field-level repair for one bounded integer (throw-vs-repair policy in shared/index.ts): a finite
 * value is rounded and clamped into [min, max]; a non-finite value is garbage, not an intent, and
 * takes the fallback.
 */
function clampInt(value: number, min: number, max: number, fallback: number): number {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

/**
 * The only way to a `Grammar`. Weights and the size/space axes are content (throw on invalid input:
 * no canonical repair); `shareDepth` is an editing quantity with an order, so it is rounded and
 * clamped into `[0, maxDepth]` of the size profile.
 *
 * The two structural invariants are checked, not repaired (there is no honest way to invent which
 * operator the author meant):
 *
 * 1. At least one terminal is active — otherwise no tree can end;
 * 2. At least one non-terminal is active — every size profile has `minDepth > 1`, so a terminal-only
 *    vocabulary cannot grow a tree.
 */
export function createGrammar(
    catalog: Catalog,
    {
        weights,
        size,
        shareDepth,
        space,
    }: {
        readonly weights: Readonly<Record<string, number | undefined>>;
        readonly size: string;
        readonly shareDepth: number;
        readonly space: string;
    },
): Grammar {
    const operatorNames = Object.keys(weights);
    // Weights are checked, never repaired: clamping garbage into "off" or saturating at maxWeight
    // would silently rewrite the vocabulary.
    if (operatorNames.length === 0) {
        throw new Error('Randomart: grammar weights must not be empty');
    }

    if (!isSizeProfileId(size)) {
        throw new Error(`Randomart: unknown size profile ${JSON.stringify(size)}`);
    }

    if (!isColorSpaceId(space)) {
        throw new Error(`Randomart: unknown color space ${JSON.stringify(space)}`);
    }

    const operators: Operator[] = [];
    for (const name of operatorNames) {
        try {
            operators.push(catalog.operator(name));
        } catch {
            throw new Error(`Randomart: operator "${name}" does not exist in catalog`);
        }
    }

    for (const [name, weight] of Object.entries(weights)) {
        if (weight === undefined) {
            continue; // An absent weight means "off": the key carries no value to validate.
        }

        assertIntegerInRange(weight, `weight of operator "${name}"`, 0, CONFIG.grammar.maxWeight);
    }

    const vocabulary = operators.filter((operator) => weightOf(weights, operator.name) > 0);

    if (!vocabulary.some(isTerminalOperator)) {
        throw new Error(
            'Randomart: grammar vocabulary must contain at least one terminal operator',
        );
    }

    if (!vocabulary.some(isNonTerminalOperator)) {
        throw new Error(
            'Randomart: grammar vocabulary must contain at least one non-terminal operator',
        );
    }

    const constraints = constraintsOf(size);
    const resolvedShareDepth = clampInt(
        shareDepth,
        MIN_SHARE_DEPTH,
        constraints.maxDepth,
        Math.min(CONFIG.channels.shareDepth, constraints.maxDepth),
    );

    // Freeze and sort weights deterministically. The names were validated against the catalog above,
    // so narrowing the literal key type to `OperatorId` is sound.
    const sortedWeights: Partial<Record<OperatorId, number>> = {};
    for (const name of [...operatorNames].sort()) {
        sortedWeights[name as OperatorId] = weightOf(weights, name);
    }

    return Object.freeze({
        weights: Object.freeze(sortedWeights),
        size,
        shareDepth: resolvedShareDepth,
        space,
    }) as Grammar;
}
