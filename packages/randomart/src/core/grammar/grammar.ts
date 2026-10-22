import { catalog } from '../catalog/default';
import type { Operator } from '../catalog/operators/Operator';
import type { OperatorId } from '../catalog/types';
import { isColorSpaceId } from '../color/color';
import { CONFIG, isSizeProfileId } from '../config/config';
import type { Constraints, SizeProfileId, ColorSpaceId } from '../config/types';
import { assertIntegerInRange } from '../shared/shared';
import { MIN_SHARE_DEPTH } from './constants';
import type { ChannelModel, Grammar } from './types';

export const isTerminalOperator = (operator: Operator): boolean => operator.isTerminal;
export const isNonTerminalOperator = (operator: Operator): boolean => !operator.isTerminal;

/** Reads a weight by name: absent or undefined means 0 (off). Single shared reader. */
export function weightOf(
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): number {
    return weights[name] ?? 0;
}

/** Depth/node budget for a size profile. */
export function constraintsOf(size: SizeProfileId): Constraints {
    return CONFIG.grammar.sizeProfiles[size];
}

/** Channel model implied by a grammar: color space and shared-trunk depth. */
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

/** Active operators (weight > 0), sorted alphabetically. */
export function getVocabulary(weights: Readonly<Record<string, number | undefined>>): Operator[] {
    return Object.keys(weights)
        .sort()
        .map((name) => catalog.operator(name))
        .filter((operator) => weightOf(weights, operator.name) > 0);
}

function isLastOfKind(
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
    isKind: (operator: Operator) => boolean,
): boolean {
    if (weightOf(weights, name) <= 0) {
        return false;
    }

    return getVocabulary(weights).filter(isKind).length === 1;
}

/** True if turning `name` off would leave no active terminals. */
export function isLastTerminal(
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): boolean {
    return isLastOfKind(weights, name, isTerminalOperator);
}

/** True if turning `name` off would leave no active non-terminals (every profile has minDepth > 1). */
export function isLastNonTerminal(
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): boolean {
    return isLastOfKind(weights, name, isNonTerminalOperator);
}

/** Clamps a finite integer to [min, max]; non-finite falls back. */
function clampInt(value: number, min: number, max: number, fallback: number): number {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

/** Generates a stable short id from the sorted weights. */
function generateGrammarId(weights: Readonly<Partial<Record<OperatorId, number>>>): string {
    const weightStr = Object.entries(weights)
        .map(([name, weight]) => `${name}:${weight}`)
        .join('|');
    let hash = 0;
    for (let i = 0; i < weightStr.length; i++) {
        hash = ((hash << 5) - hash + weightStr.charCodeAt(i)) | 0;
    }
    return `grammar-${Math.abs(hash).toString(36)}`;
}

/**
 * Creates a Grammar. Weights/size/space are content (throw on invalid); shareDepth is an editing
 * quantity, so it is rounded/clamped to [0, maxDepth]. Invariants checked (not repaired): at least
 * one terminal and one non-terminal must be active. Generates identity metadata: id from weights
 * hash, label/description as "Random grammar".
 */
export function createGrammar({
    label = 'Random',
    description = 'Randomly generated grammar',

    weights,
    size,
    shareDepth,
    space,
}: {
    readonly label?: string;
    readonly description?: string;
    readonly weights: Readonly<Record<string, number | undefined>>;
    readonly size: SizeProfileId;
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}): Grammar {
    const operatorNames = Object.keys(weights);

    // Weights are checked, never repaired: clamping would silently rewrite the vocabulary.
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

    // Freeze and sort weights deterministically; names validated above,
    // so OperatorId narrowing is sound.
    const sortedWeights: Partial<Record<OperatorId, number>> = {};
    for (const name of [...operatorNames].sort()) {
        sortedWeights[name as OperatorId] = weightOf(weights, name);
    }

    const frozenWeights = Object.freeze(sortedWeights);
    const id = generateGrammarId(frozenWeights);

    return Object.freeze({
        id,
        label,
        description,
        weights: frozenWeights,
        size,
        shareDepth: resolvedShareDepth,
        space,
    }) as Grammar;
}
