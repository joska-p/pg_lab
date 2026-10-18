import type { Catalog, Operator, OperatorId } from '../catalog';
import {
    DEFAULT_CHANNELS,
    DEFAULT_SHARE_DEPTH,
    isColorSpaceId,
    MIN_SHARE_DEPTH,
    RAW_CHANNELS,
} from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import { DEFAULT_MOTION, isMotionLevel } from '../motion/index.ts';
import type { MotionLevel } from '../motion/index.ts';
import { assertFinite } from '../shared/index.ts';
import { MAX_DEPTH, MAX_NODES, MAX_WEIGHT, MIN_WEIGHT } from './types.ts';
import type { Constraints, ConstraintsInput, Grammar } from './types.ts';

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

/**
 * True when switching `name` off would empty the terminals — i.e. it is the only active terminal
 * left, so `createGrammar` would refuse the gesture (rule 3: structure with no canonical repair).
 *
 * A derived reading of `weights`, never a stored flag: the UI uses it to disable a control that has
 * no valid outcome (the invariant itself stays in `createGrammar`). An operator that is already off
 * is not "the last terminal": there is nothing to switch off.
 */
export function isLastTerminal(
    catalog: Catalog,
    weights: Readonly<Record<string, number | undefined>>,
    name: string,
): boolean {
    if (weightOf(weights, name) <= 0) {
        return false;
    }

    return getVocabulary(catalog, weights).filter(isTerminalOperator).length === 1;
}

/**
 * The missing-field fallback shape: a non-finite constraint value is garbage, not an intent, so it
 * takes these defaults — the `defaultGrammar` shape, a finite and feasible baseline for the stock
 * catalog. `defaultGrammar` itself uses them (one value set, one meaning).
 */
export const DEFAULT_CONSTRAINTS: ConstraintsInput = { minDepth: 3, maxDepth: 8, maxNodes: 60 };

/**
 * Field-level repair for one bounded integer (throw-vs-repair policy in shared/index.ts): a finite
 * value is rounded and clamped into [min, max]; a non-finite value is garbage, not an intent, and
 * takes the fallback. The old `NaN → min` here was neither an error nor a sensible default.
 */
function clampInt(value: number, min: number, max: number, fallback: number): number {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

/**
 * The only way to a `Constraints` brand — and the shape-repair rung of the repair ladder:
 * depth/node bounds are editing quantities, so out-of-range values are clamped (rounded),
 * non-finite values take `DEFAULT_CONSTRAINTS`, and a `minDepth > maxDepth` conflict is resolved by
 * clamping minDepth down: **maxDepth wins**. No intent information reaches the core, so the
 * conservative direction is canonical — the same rule `fitConstraints` uses; the UI's opposite
 * drag-along (`appStore.setConstraints`) is an intent gesture layered on top, not an invariant to
 * keep in sync.
 */
export function createConstraints(constraints: ConstraintsInput): Constraints {
    const maxDepth = clampInt(constraints.maxDepth, 1, MAX_DEPTH, DEFAULT_CONSTRAINTS.maxDepth);
    const maxNodes = clampInt(constraints.maxNodes, 1, MAX_NODES, DEFAULT_CONSTRAINTS.maxNodes);
    const minDepth = Math.min(
        clampInt(constraints.minDepth, 1, MAX_DEPTH, DEFAULT_CONSTRAINTS.minDepth),
        maxDepth,
    );

    return Object.freeze({ minDepth, maxDepth, maxNodes }) as Constraints;
}

/**
 * Keeps constraints usable for a given vocabulary — the `ZoomClamp` analog: raw values in,
 * validated brand out, whatever garbage the UI or a JSON file feeds it. Repair pipeline
 * (throw-vs-repair policy in shared/index.ts):
 *
 * 1. Shape repair (`createConstraints`): hard-limit clamp, rounding, `minDepth ≤ maxDepth`;
 * 2. Depth beyond the vocabulary: with no non-terminal, `minDepth` always falls back to 1;
 * 3. Feasibility: `maxNodes` is raised to `minSize(1, minDepth)` (capped at `MAX_NODES`), then
 *    `minDepth` is lowered until it fits — at `minDepth = 1` every grammar is feasible, so the
 *    pipeline always terminates and `createGrammar` cannot reject on rules 5 and 7.
 */
export function fitConstraints(
    operators: readonly Operator[],
    constraints: ConstraintsInput,
): Constraints {
    // Rung 1: the shape repair — clamped, rounded, ordered.
    const shape = createConstraints(constraints);
    const maxDepth = shape.maxDepth;
    let minDepth = shape.minDepth;
    let maxNodes = shape.maxNodes;

    // Rung 2: the vocabulary yields (rule 5 repair). Lowering `maxNodes` first, then `minDepth`
    // down, always terminates since `minDepth = 1` is feasible.
    if (minDepth > 1 && !operators.some(isNonTerminalOperator)) {
        minDepth = 1;
    }

    // Rung 3: feasibility (rule 7 repair) — maxNodes climbs to the needed minimum, then minDepth
    // yields if even MAX_NODES is not enough.
    const needed = (): number => minSize(1, minDepth, operators);

    if (needed() > maxNodes) {
        maxNodes = Math.min(MAX_NODES, needed());
    }

    while (minDepth > 1 && minSize(1, minDepth, operators) > maxNodes) {
        minDepth--;
    }

    // `createConstraints` is the runtime proof that the clamp result satisfies the brand invariant.
    return createConstraints({ minDepth, maxDepth, maxNodes });
}

/**
 * A colour space is content (it defines the image), so an unknown id has no canonical repair and
 * refuses, like a bad weight (throw-vs-repair policy in shared/index.ts). `shareDepth` is an
 * editing quantity, so it is _repaired_: rounded and clamped into `[0, maxDepth]` (a non-finite
 * value takes `DEFAULT_SHARE_DEPTH`). `>= maxDepth` is a legitimate reading — one shared tree,
 * hence `r = g = b`. A missing `channels` field takes `RAW_CHANNELS`: three independent channels in
 * sRGB, the historical behaviour of a grammar built from parts without an explicit choice.
 */
function validateChannels(channels: ChannelModel, maxDepth: number): ChannelModel {
    if (!isColorSpaceId(channels.space)) {
        throw new Error(`Randomart: unknown colour space ${JSON.stringify(channels.space)}`);
    }

    return {
        space: channels.space,
        shareDepth: clampInt(channels.shareDepth, MIN_SHARE_DEPTH, maxDepth, DEFAULT_SHARE_DEPTH),
    };
}

/** Content, like a colour space: an unknown motion has no canonical repair and refuses. */
function validateMotion(motion: MotionLevel): MotionLevel {
    if (!isMotionLevel(motion)) {
        throw new Error(`Randomart: unknown motion ${JSON.stringify(motion)}`);
    }

    return motion;
}

export function createGrammar(
    catalog: Catalog,
    {
        weights,
        constraints: rawConstraints,
        channels: rawChannels = RAW_CHANNELS,
        motion = DEFAULT_MOTION,
    }: {
        readonly weights: Readonly<Record<string, number | undefined>>;
        readonly constraints: ConstraintsInput;
        readonly channels?: ChannelModel;
        readonly motion?: MotionLevel;
    },
): Grammar {
    const operatorNames = Object.keys(weights);
    // Weights are checked, never repaired (throw-vs-repair policy in shared/index.ts): a weight is
    // content — clamping garbage into "off" or saturating at MAX_WEIGHT would silently rewrite the
    // vocabulary. Corruption refuses honestly (UI error, import rejected with the field path).
    if (operatorNames.length === 0) {
        throw new Error('Randomart: grammar weights must not be empty');
    }

    // Rule 1: Every operator exists in catalog (content: an unknown name has no canonical repair)
    const operators: Operator[] = [];
    for (const name of operatorNames) {
        try {
            operators.push(catalog.operator(name));
        } catch {
            throw new Error(`Randomart: operator "${name}" does not exist in catalog`);
        }
    }

    // Rule 2: Weights are finite and within [MIN_WEIGHT, MAX_WEIGHT]
    for (const [name, weight] of Object.entries(weights)) {
        if (weight === undefined) {
            continue; // An absent weight means "off": the key carries no value to validate.
        }

        assertFinite(weight, `weight of operator "${name}"`);
        if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
            throw new Error(
                `Randomart: weight of operator "${name}" (${weight}) must be within [${MIN_WEIGHT}, ${MAX_WEIGHT}]`,
            );
        }
    }

    // The vocabulary: what the generator may draw. A weight of 0 switches the operator off.
    const vocabulary = operators.filter((operator) => weightOf(weights, operator.name) > 0);

    // Rule 3: Vocabulary contains at least one active terminal — structure with no canonical
    // repair (which terminal to switch back on would be invented content), so it throws.
    const terminals = vocabulary.filter(isTerminalOperator);
    if (terminals.length === 0) {
        throw new Error(
            'Randomart: grammar vocabulary must contain at least one terminal operator',
        );
    }

    // Rules 4-7 (constraints × vocabulary) are *repaired*, not checked (throw-vs-repair policy in
    // shared/index.ts): the raw constraints go through `fitConstraints`, whose rungs resolve the
    // hard-limit bounds, the ordering (minDepth ≤ maxDepth), the minDepth>1-without-non-terminal
    // rule (5) and feasibility (7). Feeding broken constraints can no longer reject a grammar —
    // this is the aggregate constructor, where UI and file data legitimately arrive (user
    // decision 2026-10-16).
    const constraints = fitConstraints(vocabulary, rawConstraints);

    // Freeze and sort weights deterministically. The names were validated against the catalog above,
    // so narrowing the literal key type to `OperatorId` is sound.
    const sortedWeights: Partial<Record<OperatorId, number>> = {};
    for (const name of [...operatorNames].sort()) {
        sortedWeights[name as OperatorId] = weightOf(weights, name);
    }

    return Object.freeze({
        weights: Object.freeze(sortedWeights),
        // Already frozen by createConstraints.
        constraints,
        channels: Object.freeze(validateChannels(rawChannels, constraints.maxDepth)),
        // Content, like a colour space: an unknown motion refuses (no canonical repair).
        motion: validateMotion(motion),
    }) as Grammar;
}

/**
 * The default vocabulary: the whole catalog, weighted for _structure_. There is no separate
 * "animated" preset: animation is a matter of playback (the grammar's `motion`), not of
 * vocabulary.
 *
 * These weights come from a calibration session (2026-10-17). The field of a generated expression
 * is provably bounded to `[-1, 1]` (every operator preserves the range), and every colour space
 * maps it monotonically, so the only thing that flattens an image into an aplat is a _constant_
 * field — not the mapping and not a final clamp (that clamp is dead). Measuring local flatness
 * against operator presence showed which operators structure the field and which flatten it:
 * `x`/`y`/`max` create variation, while `gt`, `add` and `const` dominate subtrees with a single
 * value. Up-weighting the first and pushing the second to the background roughly halves the share
 * of near-uniform stills (measured on the fuzz corpus: mean local flatness 59% → 41%, near-uniform
 * "aplats" 42% → 19%).
 *
 * Its colour model is `DEFAULT_CHANNELS` (a trunk of depth 2 read as OKLCH), the _curated_ default
 * — the model that actually yields readable images. `createGrammar` alone would fall back to the
 * plain raw-sRGB model (`RAW_CHANNELS`, three independent channels).
 */
export function defaultGrammar(catalog: Catalog): Grammar {
    // Typed by `OperatorId`: a mistyped operator here is a compile error (the static registry is the
    // source of truth), not a runtime import refusal.
    const weights: Partial<Record<OperatorId, number>> = {
        // Spatial anchors: always vary across the image.
        x: 4,
        y: 4,
        // Structure makers.
        max: 2,
        min: 1.5,
        // Flatteners: still in the vocabulary, pushed to the background.
        const: 0.5,
        add: 0.5,
        gt: 0.5,
        mul: 0.75,
        // Expensive combinators, as before.
        select: 0.5,
        mix: 0.5,
        warp: 0.5,
    };

    // Every other catalog operator gets the neutral weight 1.
    for (const operator of catalog.operators()) {
        weights[operator.name as OperatorId] ??= 1;
    }

    return createGrammar(catalog, {
        weights,
        constraints: DEFAULT_CONSTRAINTS,
        channels: DEFAULT_CHANNELS,
    });
}
