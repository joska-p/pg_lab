import type { Catalog, Operator } from '../catalog';
import { DEFAULT_COLOR, isPaletteId, UNRELATED_COLOR } from '../color/index.ts';
import type { ColorModel } from '../color/index.ts';
import { assertFinite } from '../shared/index.ts';
import { MAX_DEPTH, MAX_NODES, MAX_WEIGHT, MIN_WEIGHT } from './types';
import type { Constraints, ConstraintsInput, Grammar } from './types';

export const isTerminalOperator = (operator: Operator): boolean => operator.isTerminal;
export const isNonTerminalOperator = (operator: Operator): boolean => !operator.isTerminal;

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
    weights: Readonly<Record<string, number>>,
): Operator[] {
    return Object.keys(weights)
        .sort()
        .map((name) => catalog.operator(name))
        .filter((operator) => weights[operator.name] > 0);
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
    weights: Readonly<Record<string, number>>,
    name: string,
): boolean {
    if ((weights[name] ?? 0) <= 0) {
        return false;
    }

    return getVocabulary(catalog, weights).filter(isTerminalOperator).length === 1;
}

/**
 * The missing-field fallback shape (findings F12): a non-finite constraint value is garbage, not an
 * intent, so it takes these defaults — the `defaultGrammar` shape, a finite and feasible baseline
 * for the stock catalog. `defaultGrammar` itself uses them (one value set, one meaning).
 */
export const DEFAULT_CONSTRAINTS: ConstraintsInput = { minDepth: 3, maxDepth: 8, maxNodes: 60 };

/**
 * Field-level repair for one bounded integer (throw-vs-repair policy in shared/index.ts): a finite
 * value is rounded and clamped into [min, max]; a non-finite value is garbage, not an intent, and
 * takes the fallback. (F12's old `NaN → min` here was neither an error nor a sensible default.)
 */
function clampInt(value: number, min: number, max: number, fallback: number): number {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

/**
 * The only way to a `Constraints` brand (findings F10) — and the shape-repair rung of the repair
 * ladder: depth/node bounds are editing quantities, so out-of-range values are clamped (rounded),
 * non-finite values take `DEFAULT_CONSTRAINTS`, and a `minDepth > maxDepth` conflict is resolved by
 * clamping minDepth down: **maxDepth wins** ("les rendre égales", user decision 2026-10-16). No
 * intent information reaches the core, so the conservative direction is canonical — the same rule
 * `fitConstraints` uses; the UI's opposite drag-along (`appStore.setConstraints`) is an intent
 * gesture layered on top, not an invariant to keep in sync.
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
 * Keeps constraints usable for a given vocabulary — the `ZoomClamp` analog (findings F11): raw
 * values in, validated brand out, whatever garbage the UI or a JSON file feeds it. Repair pipeline
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
 * A colour model is content (it defines the image), so an unknown palette id has no canonical
 * repair and refuses, like a bad weight (throw-vs-repair policy in shared/index.ts). A missing
 * `color` field takes `UNRELATED_COLOR` — the plain three-channel model, the behaviour of a grammar
 * built from parts without an explicit choice.
 */
function validateColor(color: ColorModel): ColorModel {
    if (color.kind === 'unrelated') {
        return { kind: 'unrelated' };
    }

    if (color.kind === 'correlated') {
        if (!isPaletteId(color.palette)) {
            throw new Error(`Randomart: unknown palette ${JSON.stringify(color.palette)}`);
        }

        return { kind: 'correlated', palette: color.palette };
    }

    throw new Error(`Randomart: unknown color model ${JSON.stringify(color)}`);
}

export function createGrammar(
    catalog: Catalog,
    {
        weights,
        constraints: rawConstraints,
        color: rawColor = UNRELATED_COLOR,
    }: {
        readonly weights: Readonly<Record<string, number>>;
        readonly constraints: ConstraintsInput;
        readonly color?: ColorModel;
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
        assertFinite(weight, `weight of operator "${name}"`);
        if (weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
            throw new Error(
                `Randomart: weight of operator "${name}" (${weight}) must be within [${MIN_WEIGHT}, ${MAX_WEIGHT}]`,
            );
        }
    }

    // The vocabulary: what the generator may draw. A weight of 0 switches the operator off.
    const vocabulary = operators.filter((operator) => weights[operator.name] > 0);

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

    // Freeze and sort weights deterministically
    const sortedWeights: Record<string, number> = {};
    for (const name of [...operatorNames].sort()) {
        sortedWeights[name] = weights[name];
    }

    return Object.freeze({
        weights: Object.freeze(sortedWeights),
        // Already frozen by createConstraints.
        constraints,
        color: Object.freeze(validateColor(rawColor)),
    }) as Grammar;
}

/**
 * The default vocabulary: the whole catalog, with spatial terminals favoured and the expensive
 * combinators down-weighted. Time terminals (`tsin`, `tcos`) are ordinary members of the catalog,
 * so there is no separate "animated" preset: one seed gives one expression, and animation is a
 * matter of playback.
 *
 * Its colour model is `DEFAULT_COLOR` (one field through a palette), the _curated_ default — the
 * model that actually yields readable images. `createGrammar` alone would fall back to the plain
 * unrelated model (`UNRELATED_COLOR`).
 */
export function defaultGrammar(catalog: Catalog): Grammar {
    const weights: Record<string, number> = {
        x: 3,
        y: 3,
        const: 1,
    };

    for (const operator of catalog.operators()) {
        if (operator.name === 'x' || operator.name === 'y' || operator.name === 'const') {
            continue;
        }
        weights[operator.name] =
            operator.name === 'select' || operator.name === 'mix' || operator.name === 'warp'
                ? 0.5
                : 1;
    }

    return createGrammar(catalog, {
        weights,
        constraints: DEFAULT_CONSTRAINTS,
        color: DEFAULT_COLOR,
    });
}
