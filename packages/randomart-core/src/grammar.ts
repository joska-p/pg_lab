import type { ColorSpaceId } from './colors';
import { GrammarDrawError, InfeasibleGrammarError, RandomArtError } from './errors';
import { OP_NAMES, OPS, getOp, isOpName, isTerminal } from './ops';
import type { OpName } from './ops';
import type { Rng } from './rng';

export const MAX_WEIGHT = 16;

type Weights = Readonly<Partial<Record<OpName, number>>>;

export interface Grammar {
    /** Only operators with a positive weight are present. */
    readonly weights: Weights;
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
    /** Depth down to which the three channels share the same operators. */
    readonly shareDepth: number;
}

export interface CreateGrammarOptions {
    readonly weights: Weights;
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
    readonly shareDepth: number;
}

/** A registry entry: a grammar plus a suggested color space, a label and a description. */
export interface GrammarPreset<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly description: string;
    readonly grammar: Grammar;
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
 * Smallest tree size that still satisfies `minDepth`, from `depth` down. The returned function
 * memoizes per depth; create one per (vocabulary, minDepth) pair.
 */
export function createMinimumSizer(
    vocab: readonly OpName[],
    minDepth: number,
): (depth: number) => number {
    const memo = new Map<number, number>();

    function minimumSize(depth: number): number {
        const cached = memo.get(depth);
        if (cached !== undefined) {
            return cached;
        }
        if (depth >= minDepth) {
            return 1;
        }

        let smallest = Number.POSITIVE_INFINITY;
        for (const name of vocab) {
            const { arity } = getOp(name);
            if (arity === 0) {
                continue;
            }
            smallest = Math.min(smallest, 1 + arity * minimumSize(depth + 1));
        }

        const size = smallest === Number.POSITIVE_INFINITY ? 1 : smallest;
        memo.set(depth, size);
        return size;
    }

    return minimumSize;
}

/**
 * Fewest nodes one channel can have for this grammar. `maxNodes` is a per-channel budget and a
 * shared trunk is replicated in every channel, so `shareDepth` does not matter here.
 */
export function minimumNodes(grammar: Grammar): number {
    return createMinimumSizer(vocabulary(grammar), grammar.minDepth)(1);
}

/**
 * Largest minDepth in [1, limit] whose minimumNodes fits `grammar.maxNodes`. Never below 1:
 * minDepth 1 needs a single node.
 */
export function maxFeasibleMinDepth(grammar: Grammar, limit: number): number {
    for (let depth = limit; depth > 1; depth--) {
        if (minimumNodes({ ...grammar, minDepth: depth }) <= grammar.maxNodes) {
            return depth;
        }
    }
    return 1;
}

function normalizeWeights(weights: Weights): Partial<Record<OpName, number>> {
    const normalized: Partial<Record<OpName, number>> = {};

    for (const [name, weight] of Object.entries(weights)) {
        if (!isOpName(name)) {
            throw new RandomArtError(`Unknown operator in grammar: ${name}`);
        }
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
    const enabled = OPS.filter((op) => (weights[op.id] ?? 0) > 0);

    if (enabled.length === 0) {
        throw new RandomArtError('Grammar must enable at least one operator');
    }
    if (!enabled.some((op) => op.arity === 0)) {
        throw new RandomArtError('Grammar must enable at least one terminal');
    }
    if (!enabled.some((op) => op.arity > 0)) {
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
 * Validate and normalise a grammar: weights become integers in [0, MAX_WEIGHT] for known operators;
 * zero-weight operators are dropped, and `shareDepth` must fit `maxDepth`. Invalid choices throw
 * instead of being clamped, so a slider cannot silently disagree with the grammar it produced.
 */
export function createGrammar(options: CreateGrammarOptions): Grammar {
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
        weights: Object.freeze(weights),
        minDepth,
        maxDepth,
        maxNodes,
        shareDepth,
    });

    const minNodes = minimumNodes(tempGrammar);
    if (minNodes > maxNodes) {
        throw new InfeasibleGrammarError(
            `Grammar is infeasible: minimumNodes (${minNodes}) > maxNodes (${maxNodes}). ` +
                `Increase maxNodes or decrease minDepth.`,
        );
    }

    return tempGrammar;
}

/**
 * Build a registry preset from a label, a description, grammar options and a suggested color space.
 * The grammar itself never carries preset metadata.
 */
function preset<TId extends string>(
    id: TId,
    label: string,
    description: string,
    options: CreateGrammarOptions,
    space: ColorSpaceId,
): GrammarPreset<TId> {
    return { id, label, description, grammar: createGrammar(options), space };
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
    ]);
}

export interface GrammarPins {
    readonly minDepth?: number;
    readonly maxDepth?: number;
    readonly maxNodes?: number;
    readonly shareDepth?: number;
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

        try {
            return createGrammar({ weights, minDepth, maxDepth, maxNodes, shareDepth });
        } catch (error) {
            if (error instanceof InfeasibleGrammarError) {
                continue; // Try again with different random values
            }
            throw error;
        }
    }

    throw new GrammarDrawError(`Failed to draw a feasible grammar after ${MAX_ATTEMPTS} attempts`);
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

export const GRAMMAR_PRESETS = [
    preset(
        'default',
        'Default',
        'Neutral baseline: every operator at moderate weight — pure surprise.',
        {
            weights: {
                abs: 4,
                add: 6,
                const: 4,
                cos: 4,
                div: 2,
                gt: 2,
                max: 4,
                min: 4,
                mix: 4,
                mul: 6,
                neg: 2,
                select: 2,
                sin: 4,
                sqr: 4,
                warp: 2,
                x: 8,
                y: 8,
            },
            minDepth: 2,
            maxDepth: 5,
            maxNodes: 25,
            shareDepth: 2,
        },
        'oklch',
    ),
    preset(
        'monochrome',
        'Monochrome',
        'Grayscale forms: channels stay locked, arithmetic only.',
        {
            weights: {
                abs: 16,
                add: 8,
                const: 4,
                div: 2,
                max: 16,
                min: 16,
                mix: 2,
                mul: 8,
                neg: 4,
                sqr: 16,
                sub: 4,
                x: 8,
                y: 8,
            },
            minDepth: 2,
            maxDepth: 5,
            maxNodes: 25,
            shareDepth: 5,
        },
        'srgb',
    ),
    preset(
        'prism',
        'Prism',
        'Vivid polychrome: independent channels, sine and cosine waves.',
        {
            weights: {
                add: 4,
                const: 4,
                cos: 16,
                mix: 16,
                mul: 4,
                sin: 16,
                x: 8,
                y: 8,
            },
            minDepth: 2,
            maxDepth: 5,
            maxNodes: 25,
            shareDepth: 0,
        },
        'oklch',
    ),
    preset(
        'warped',
        'Warped',
        'Flowing distortions: folded, warped coordinates.',
        {
            weights: {
                add: 4,
                const: 4,
                cos: 12,
                mul: 4,
                sin: 12,
                warp: 16,
                x: 8,
                y: 8,
            },
            minDepth: 1,
            maxDepth: 6,
            maxNodes: 40,
            shareDepth: 1,
        },
        'hsl',
    ),
    preset(
        'graphic',
        'Graphic',
        'Bold posterization: hard edges from comparisons and selects.',
        {
            weights: {
                abs: 16,
                const: 4,
                gt: 16,
                max: 8,
                min: 8,
                mix: 4,
                neg: 4,
                select: 16,
                sqr: 16,
                x: 8,
                y: 8,
            },
            minDepth: 2,
            maxDepth: 5,
            maxNodes: 25,
            shareDepth: 2,
        },
        'srgb',
    ),
] as const satisfies readonly GrammarPreset[];

// Derive the types directly from the registry.
export type GrammarPresetDefinition = (typeof GRAMMAR_PRESETS)[number];
export type GrammarPresetId = GrammarPresetDefinition['id'];

const grammarPresetsById = new Map<string, GrammarPresetDefinition>(
    GRAMMAR_PRESETS.map((preset): [GrammarPresetId, GrammarPresetDefinition] => [
        preset.id,
        preset,
    ]),
);

/**
 * Resolve a preset by id. Unknown ids are a programming error: every caller either holds a
 * `GrammarRegistryId` or has compared an external value with `presetOf`.
 */
export function getGrammarPreset(id: GrammarPresetId): GrammarPresetDefinition {
    const preset = grammarPresetsById.get(id);

    if (preset === undefined) {
        throw new RandomArtError(`Unknown grammar preset: ${id}`);
    }

    return preset;
}

/** Registry id of the preset a grammar equals, if any. */
export function presetOf(grammar: Grammar): GrammarPresetId | undefined {
    const key = grammarKey(grammar);
    return GRAMMAR_PRESETS.find((preset) => grammarKey(preset.grammar) === key)?.id;
}
