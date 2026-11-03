import { COLOR_SPACE_IDS, isColorSpaceId } from './colors';
import type { ColorSpaceId } from './colors';
import { RandomArtError } from './errors';
import { OP_NAMES, ops } from './ops';
import type { OpName } from './ops';
import type { Rng } from './rng';

export interface SizeConstraints {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

export const SIZE_PROFILES = {
    tiny: { minDepth: 1, maxDepth: 3, maxNodes: 10 },
    small: { minDepth: 1, maxDepth: 4, maxNodes: 16 },
    medium: { minDepth: 2, maxDepth: 5, maxNodes: 25 },
    large: { minDepth: 2, maxDepth: 6, maxNodes: 40 },
} as const satisfies Record<string, SizeConstraints>;

export type SizeProfile = keyof typeof SIZE_PROFILES;

export const SIZE_PROFILE_IDS = Object.keys(SIZE_PROFILES) as readonly SizeProfile[];

export const MAX_WEIGHT = 16;

export interface Grammar {
    readonly label: string;
    readonly description: string;
    /** Only operators with a positive weight are present. */
    readonly weights: Readonly<Partial<Record<OpName, number>>>;
    readonly size: SizeProfile;
    /** Depth down to which the three channels share the same operators. */
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}

export interface GrammarOptions {
    readonly label?: string;
    readonly description?: string;
    readonly weights: Readonly<Partial<Record<OpName, number>>>;
    readonly size: SizeProfile;
    readonly shareDepth: number;
    readonly space?: ColorSpaceId;
}

function isTerminal(name: OpName): boolean {
    return ops[name].arity === 0;
}

function normalizeWeights(
    weights: Readonly<Partial<Record<OpName, number>>>,
): Partial<Record<OpName, number>> {
    for (const name of Object.keys(weights)) {
        if (!Object.hasOwn(ops, name)) {
            throw new RandomArtError(`Unknown operator in grammar: ${name}`);
        }
    }

    const normalized: Partial<Record<OpName, number>> = {};
    for (const name of OP_NAMES) {
        const weight = weights[name];
        if (weight === undefined || weight === 0) {
            continue;
        }
        if (!Number.isInteger(weight) || weight < 0 || weight > MAX_WEIGHT) {
            throw new RandomArtError(
                `Weight of "${name}" must be an integer in [0, ${MAX_WEIGHT}], got ${weight}`,
            );
        }
        normalized[name] = weight;
    }
    return normalized;
}

function assertVocabulary(weights: Readonly<Partial<Record<OpName, number>>>): void {
    const names = Object.keys(weights) as OpName[];
    if (names.length === 0) {
        throw new RandomArtError('Grammar must enable at least one operator');
    }
    if (!names.some(isTerminal)) {
        throw new RandomArtError('Grammar must enable at least one terminal');
    }
    if (!names.some((name) => !isTerminal(name))) {
        throw new RandomArtError('Grammar must enable at least one non-terminal');
    }
}

function ensureEnabled(weights: Partial<Record<OpName, number>>, terminal: boolean): void {
    const enabled = OP_NAMES.some((name) => {
        const weight = weights[name];
        return weight !== undefined && weight > 0 && isTerminal(name) === terminal;
    });
    if (enabled) {
        return;
    }
    const fallback = OP_NAMES.find((name) => isTerminal(name) === terminal);
    if (fallback !== undefined) {
        weights[fallback] = 1;
    }
}

/**
 * Validate and normalise a grammar: weights become integers in [1, MAX_WEIGHT] restricted to known
 * operators, and `shareDepth` must fit the size profile. Invalid choices throw instead of being
 * clamped, so a slider cannot silently disagree with the grammar it produced.
 */
export function createGrammar(options: GrammarOptions): Grammar {
    const { size } = options;
    if (!Object.hasOwn(SIZE_PROFILES, size)) {
        throw new RandomArtError(`Unknown size profile: ${size}`);
    }
    const space = options.space ?? 'srgb';
    if (!isColorSpaceId(space)) {
        throw new RandomArtError(`Unknown color space: ${space}`);
    }

    const weights = normalizeWeights(options.weights);
    assertVocabulary(weights);

    const { maxDepth } = SIZE_PROFILES[size];
    const { shareDepth } = options;
    if (!Number.isInteger(shareDepth) || shareDepth < 0 || shareDepth > maxDepth) {
        throw new RandomArtError(
            `shareDepth must be an integer in [0, ${maxDepth}] for size "${size}", got ${shareDepth}`,
        );
    }

    return Object.freeze({
        label: options.label ?? 'Custom',
        description: options.description ?? 'Custom grammar',
        weights: Object.freeze(weights),
        size,
        shareDepth,
        space,
    });
}

/** Weight of an operator in a grammar; absent operators weigh nothing. */
export function weightOf(grammar: Grammar, name: OpName): number {
    return grammar.weights[name] ?? 0;
}

/** Operators enabled by a grammar, in canonical name order. */
export function vocabulary(grammar: Grammar): readonly OpName[] {
    return OP_NAMES.filter((name) => weightOf(grammar, name) > 0);
}

/** Stable identity of a grammar, independent of how its weights were built. */
export function grammarKey(grammar: Grammar): string {
    const weights = OP_NAMES.map((name) => `${name}:${weightOf(grammar, name)}`);
    return JSON.stringify([weights, grammar.size, grammar.shareDepth, grammar.space]);
}

export interface GrammarPins {
    readonly size?: SizeProfile;
    readonly shareDepth?: number;
    readonly space?: ColorSpaceId;
}

/** Draw a random grammar. Iteration follows `OP_NAMES` so the result never depends on table order. */
export function drawGrammar(rng: Rng, pins: GrammarPins = {}): Grammar {
    const weights: Partial<Record<OpName, number>> = {};
    for (const name of OP_NAMES) {
        weights[name] = rng.int(MAX_WEIGHT + 1);
    }

    ensureEnabled(weights, true);
    ensureEnabled(weights, false);

    const size = pins.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)];
    const shareDepth = pins.shareDepth ?? rng.int(SIZE_PROFILES[size].maxDepth + 1);
    const space = pins.space ?? COLOR_SPACE_IDS[rng.int(COLOR_SPACE_IDS.length)];

    return createGrammar({ weights, size, shareDepth, space });
}

function isOnlyKind(grammar: Grammar, name: OpName, terminal: boolean): boolean {
    if (weightOf(grammar, name) === 0 || isTerminal(name) !== terminal) {
        return false;
    }
    return vocabulary(grammar).filter((enabled) => isTerminal(enabled) === terminal).length === 1;
}

/** True when `name` is the last enabled terminal of the grammar. */
export function isOnlyTerminal(grammar: Grammar, name: OpName): boolean {
    return isOnlyKind(grammar, name, true);
}

/** True when `name` is the last enabled non-terminal of the grammar. */
export function isOnlyNonTerminal(grammar: Grammar, name: OpName): boolean {
    return isOnlyKind(grammar, name, false);
}

export const grammarRegistry = {
    default: createGrammar({
        label: 'Default',
        description: 'Default grammar',
        weights: {
            abs: 1,
            add: 1,
            const: 1,
            cos: 1,
            div: 1,
            gt: 1,
            max: 2,
            min: 2,
            mix: 1,
            mul: 1,
            neg: 1,
            select: 1,
            sin: 1,
            sqr: 1,
            warp: 1,
            x: 4,
            y: 4,
        },
        size: 'medium',
        shareDepth: 2,
        space: 'oklch',
    }),
} as const satisfies Record<string, Grammar>;

export type GrammarRegistryId = keyof typeof grammarRegistry;

/** Registry id of the preset a grammar equals, if any. */
export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
    const key = grammarKey(grammar);
    const ids = Object.keys(grammarRegistry) as GrammarRegistryId[];
    return ids.find((id) => grammarKey(grammarRegistry[id]) === key);
}
