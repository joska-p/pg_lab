import { COLOR_SPACE_IDS, isColorSpaceId } from './colors';
import type { ColorSpaceId } from './colors';
import { RandomArtError } from './errors';
import { OP_NAMES, ops, isTerminal } from './ops';
import type { OpName } from './ops';
import type { Rng } from './rng';

export const MAX_WEIGHT = 16;

type Weights = Readonly<Partial<Record<OpName, number>>>;

export interface Grammar {
    readonly label: string;
    readonly description: string;
    /** Only operators with a positive weight are present. */
    readonly weights: Weights;
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
    /** Depth down to which the three channels share the same operators. */
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}

export interface GrammarOptions {
    readonly label?: string;
    readonly description?: string;
    readonly weights: Weights;
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
    readonly shareDepth: number;
    readonly space: ColorSpaceId;
}

/** Weight of an operator in a grammar; absent operators weigh nothing. */
export function weightOf(grammar: Grammar, name: OpName): number {
    return grammar.weights[name] ?? 0;
}

/** Operators enabled by a grammar, in canonical name order. */
export function vocabulary(grammar: Grammar): readonly OpName[] {
    return OP_NAMES.filter((name) => weightOf(grammar, name) > 0);
}

/**
 * Compute the minimum number of nodes a grammar can produce. This is the size of the smallest valid
 * tree respecting minDepth and the enabled vocabulary.
 */
export function minimumNodes(grammar: Grammar): number {
    const vocab = vocabulary(grammar);
    const minDepth = grammar.minDepth;
    const shareDepth = grammar.shareDepth;
    const memo = new Map<number, number>();

    function minSize(depth: number): number {
        const cached = memo.get(depth);
        if (cached !== undefined) {
            return cached;
        }
        if (depth >= minDepth) {
            return 1;
        }

        let smallest = Number.POSITIVE_INFINITY;
        for (const name of vocab) {
            const { arity } = ops[name];
            if (arity === 0) {
                continue;
            }
            smallest = Math.min(smallest, 1 + arity * minSize(depth + 1));
        }

        const size = smallest === Number.POSITIVE_INFINITY ? 1 : smallest;
        memo.set(depth, size);
        return size;
    }

    // The trunk has 3 channels sharing down to shareDepth
    if (shareDepth >= minDepth) {
        return minSize(1);
    }

    // Shared trunk down to shareDepth, then 3 independent channels
    let sharedSize = 0;
    for (let depth = 1; depth <= shareDepth; depth++) {
        // At each shared depth, we need at least one non-terminal
        let smallest = Number.POSITIVE_INFINITY;
        for (const name of vocab) {
            const { arity } = ops[name];
            if (arity === 0) {
                continue;
            }
            smallest = Math.min(smallest, 1 + arity * minSize(depth + 1));
        }
        sharedSize += smallest === Number.POSITIVE_INFINITY ? 1 : smallest;
    }

    // After shareDepth, three independent channels
    const channelMin = minSize(shareDepth + 1);
    return sharedSize + 3 * channelMin;
}

function normalizeWeights(weights: Weights): Partial<Record<OpName, number>> {
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

function assertVocabulary(weights: Weights): void {
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
 * operators, and `shareDepth` must fit `maxDepth`. Invalid choices throw instead of being clamped,
 * so a slider cannot silently disagree with the grammar it produced.
 */
export function createGrammar(options: GrammarOptions): Grammar {
    const { minDepth, maxDepth, maxNodes } = options;

    if (!Number.isInteger(minDepth) || minDepth < 1) {
        throw new RandomArtError(`minDepth must be an integer >= 1, got ${minDepth}`);
    }
    if (!Number.isInteger(maxDepth) || maxDepth < minDepth) {
        throw new RandomArtError(
            `maxDepth must be an integer >= minDepth (${minDepth}), got ${maxDepth}`,
        );
    }
    if (!Number.isInteger(maxNodes) || maxNodes < 1) {
        throw new RandomArtError(`maxNodes must be an integer >= 1, got ${maxNodes}`);
    }

    const space = options.space ?? 'srgb';
    if (!isColorSpaceId(space)) {
        throw new RandomArtError(`Unknown color space: ${space}`);
    }

    const weights = normalizeWeights(options.weights);
    assertVocabulary(weights);

    const { shareDepth } = options;
    if (!Number.isInteger(shareDepth) || shareDepth < 0 || shareDepth > maxDepth) {
        throw new RandomArtError(
            `shareDepth must be an integer in [0, ${maxDepth}], got ${shareDepth}`,
        );
    }

    // Validate grammar feasibility: minimumNodes must fit within maxNodes
    const tempGrammar = Object.freeze({
        label: options.label ?? 'Custom',
        description: options.description ?? 'Custom grammar',
        weights: Object.freeze(weights),
        minDepth,
        maxDepth,
        maxNodes,
        shareDepth,
        space,
    });

    const minNodes = minimumNodes(tempGrammar);
    if (minNodes > maxNodes) {
        throw new RandomArtError(
            `Grammar is infeasible: minimumNodes (${minNodes}) > maxNodes (${maxNodes}). ` +
                `Increase maxNodes or decrease minDepth/shareDepth.`,
        );
    }

    return tempGrammar;
}

/** Stable identity of a grammar, independent of how its weights were built. */
export function grammarKey(grammar: Grammar): string {
    const weights = OP_NAMES.map((name) => `${name}:${weightOf(grammar, name)}`);
    return JSON.stringify([
        weights,
        grammar.minDepth,
        grammar.maxDepth,
        grammar.maxNodes,
        grammar.shareDepth,
        grammar.space,
    ]);
}

export interface GrammarPins {
    readonly minDepth?: number;
    readonly maxDepth?: number;
    readonly maxNodes?: number;
    readonly shareDepth?: number;
    readonly space?: ColorSpaceId;
}

/** Draw a random grammar. Iteration follows `OP_NAMES` so the result never depends on table order. */
export function drawGrammar(rng: Rng, pins: GrammarPins = {}): Grammar {
    const MAX_ATTEMPTS = 100;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const weights: Partial<Record<OpName, number>> = {};
        for (const name of OP_NAMES) {
            weights[name] = rng.int(MAX_WEIGHT + 1);
        }

        ensureEnabled(weights, true);
        ensureEnabled(weights, false);

        const minDepth = pins.minDepth ?? 1 + rng.int(6);
        const maxDepth = pins.maxDepth ?? minDepth + rng.int(5);
        const maxNodes = pins.maxNodes ?? 8 + rng.int(60);
        const shareDepth = pins.shareDepth ?? rng.int(maxDepth + 1);
        const space = pins.space ?? COLOR_SPACE_IDS[rng.int(COLOR_SPACE_IDS.length)];

        try {
            return createGrammar({ weights, minDepth, maxDepth, maxNodes, shareDepth, space });
        } catch (error) {
            if (
                error instanceof RandomArtError &&
                error.message.startsWith('Grammar is infeasible')
            ) {
                continue; // Try again with different random values
            }
            throw error;
        }
    }

    throw new RandomArtError(`Failed to draw a feasible grammar after ${MAX_ATTEMPTS} attempts`);
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

/** True when the grammar produces a single shared expression for all three channels. */
export function isMono(grammar: Grammar): boolean {
    return grammar.shareDepth >= grammar.maxDepth;
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
        minDepth: 2,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 2,
        space: 'oklch',
    }),
    geometric: createGrammar({
        label: 'Geometric',
        description: 'Sharp shapes, hard edges, structured patterns',
        weights: {
            abs: 3,
            add: 1,
            const: 1,
            gt: 4,
            max: 3,
            min: 3,
            select: 4,
            x: 3,
            y: 3,
        },
        minDepth: 2,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 1,
        space: 'hsl',
    }),
    organic: createGrammar({
        label: 'Organic',
        description: 'Flowing waves, smooth gradients, natural forms',
        weights: {
            add: 2,
            cos: 3,
            div: 1,
            mix: 2,
            mul: 2,
            sin: 4,
            warp: 2,
            x: 3,
            y: 3,
        },
        minDepth: 2,
        maxDepth: 6,
        maxNodes: 40,
        shareDepth: 3,
        space: 'oklch',
    }),
    fractal: createGrammar({
        label: 'Fractal',
        description: 'Self-similar detail, kaleidoscopic distortion',
        weights: {
            abs: 2,
            cos: 2,
            sin: 3,
            warp: 5,
            x: 2,
            y: 2,
        },
        minDepth: 2,
        maxDepth: 6,
        maxNodes: 40,
        shareDepth: 2,
        space: 'oklch',
    }),
    minimalist: createGrammar({
        label: 'Minimalist',
        description: 'Clean gradients, simple transitions, readable forms',
        weights: {
            add: 3,
            const: 2,
            mul: 2,
            x: 4,
            y: 4,
        },
        minDepth: 1,
        maxDepth: 4,
        maxNodes: 16,
        shareDepth: 4,
        space: 'srgb',
    }),
    texture: createGrammar({
        label: 'Texture',
        description: 'Grainy, noisy, high-frequency detail',
        weights: {
            abs: 3,
            const: 4,
            mul: 2,
            sin: 2,
            sqr: 3,
            x: 1,
            y: 1,
        },
        minDepth: 2,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 0,
        space: 'oklab',
    }),
    monochrome: createGrammar({
        label: 'Monochrome',
        description: 'Single-channel harmony, tonal structure',
        weights: {
            add: 2,
            gt: 2,
            max: 3,
            min: 3,
            x: 3,
            y: 3,
        },
        minDepth: 2,
        maxDepth: 5,
        maxNodes: 25,
        shareDepth: 5,
        space: 'srgb',
    }),
    psychedelic: createGrammar({
        label: 'Psychedelic',
        description: 'Wild color cycling, heavy warp, chaotic energy',
        weights: {
            cos: 2,
            mix: 3,
            select: 3,
            sin: 3,
            warp: 4,
            x: 2,
            y: 2,
        },
        minDepth: 2,
        maxDepth: 6,
        maxNodes: 40,
        shareDepth: 0,
        space: 'hsl',
    }),
} as const satisfies Record<string, Grammar>;

export type GrammarRegistryId = keyof typeof grammarRegistry;

/** Registry id of the preset a grammar equals, if any. */
export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
    const key = grammarKey(grammar);
    const ids = Object.keys(grammarRegistry) as GrammarRegistryId[];
    return ids.find((id) => grammarKey(grammarRegistry[id]) === key);
}
