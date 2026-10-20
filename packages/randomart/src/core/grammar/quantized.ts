import type { Catalog } from '../catalog/Catalog';
import type { Operator } from '../catalog/operators/Operator';
import type { OperatorId } from '../catalog/operators/registry';
import { COLOR_SPACE_IDS } from '../color/color';
import { CONFIG } from '../config/config';
import type { SizeProfileId } from '../config/config';
import type { Rng } from '../random/rng';
import { createSeed } from '../random/seed';
import type { Seed } from '../random/seed';
import {
    constraintsOf,
    createGrammar,
    isNonTerminalOperator,
    isTerminalOperator,
    weightOf,
} from './grammar';
import type { Grammar, GrammarPins } from './types';

/**
 * The quantized grammar space: every operator weight is an integer in `[0,
 * CONFIG.grammar.maxWeight]`, the size profile fixes the constraints, and `shareDepth` is bounded
 * by that profile's `maxDepth`. Everything is discrete by construction; there is no continuous
 * recipe behind a grammar.
 */

export type { SizeProfileId } from '../config/config';

export const SIZE_PROFILE_IDS = Object.keys(
    CONFIG.grammar.sizeProfiles,
) as readonly SizeProfileId[];

/** Stable identity, for deduplication, caches and preset matching. */
export function grammarKey(catalog: Catalog, grammar: Grammar): string {
    const weights = catalog
        .operators()
        .map((operator) => `${operator.name}:${weightOf(grammar.weights, operator.name)}`);

    return JSON.stringify([weights, grammar.size, grammar.shareDepth, grammar.space]);
}

/** Raises the first operator of the list to weight 1 when the whole list is off. */
function ensureActive(
    weights: Partial<Record<OperatorId, number>>,
    operators: readonly Operator[],
): void {
    if (operators.some((operator) => weightOf(weights, operator.name) > 0)) {
        return;
    }

    const first = operators[0];

    if (first) {
        weights[first.name as OperatorId] = 1;
    }
}

/**
 * A drawn grammar is always usable: at least one terminal (a tree can end) and one non-terminal
 * (every size profile has `minDepth > 1`, so a terminal-only vocabulary cannot grow). Independent
 * uniform draws almost never violate either rule; the repair is deterministic and consumes no
 * PRNG.
 */
function ensureUsableVocabulary(
    catalog: Catalog,
    weights: Partial<Record<OperatorId, number>>,
): void {
    ensureActive(weights, catalog.operators().filter(isTerminalOperator));
    ensureActive(weights, catalog.operators().filter(isNonTerminalOperator));
}

/**
 * A random point of the space: one independent uniform weight per operator, then the size, share
 * and color axes. The seed stays comparable across grammars (`drawGrammar` consumes its own RNG).
 * Pins replace an axis instead of drawing it.
 */
export function drawGrammar(catalog: Catalog, rng: Rng, pins: GrammarPins = {}): Grammar {
    const weights: Partial<Record<OperatorId, number>> = {};

    for (const operator of catalog.operators()) {
        weights[operator.name as OperatorId] = rng.int(CONFIG.grammar.maxWeight + 1);
    }

    ensureUsableVocabulary(catalog, weights);

    const size = pins.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)];
    const maxDepth = constraintsOf(size).maxDepth;
    const shareDepth = pins.shareDepth ?? rng.int(maxDepth + 1);
    const space = pins.space ?? COLOR_SPACE_IDS[rng.int(COLOR_SPACE_IDS.length)];

    return createGrammar(catalog, { weights, size, shareDepth, space });
}

export interface StepGrammarOptions {
    /** Probability that one operator moves one notch. Default: `CONFIG.sampling.changeRate`. */
    readonly changeRate?: number;
}

/**
 * One exploration step on the grid: each operator moves one integer notch up or down with
 * probability `changeRate`, clipped at the edges. Only the weights move — size, share and color are
 * axes of their own. The two viability invariants are restored deterministically, so the result is
 * always a point of the space. Deterministic: one `rng.next()` per operator, plus one per moving
 * operator for its direction.
 *
 * @lintignore
 */
export function stepGrammar(
    catalog: Catalog,
    grammar: Grammar,
    rng: Rng,
    options: StepGrammarOptions = {},
): Grammar {
    const changeRate = options.changeRate ?? CONFIG.sampling.changeRate;

    if (!Number.isFinite(changeRate) || changeRate < 0 || changeRate > 1) {
        throw new Error(
            `Randomart: changeRate must be a finite number in [0, 1], received ${changeRate}`,
        );
    }

    const weights: Partial<Record<OperatorId, number>> = { ...grammar.weights };

    for (const operator of catalog.operators()) {
        if (rng.next() < changeRate) {
            const current = weightOf(weights, operator.name);
            const up = rng.next() < 0.5;

            weights[operator.name as OperatorId] = up
                ? Math.min(CONFIG.grammar.maxWeight, current + 1)
                : Math.max(0, current - 1);
        }
    }

    ensureUsableVocabulary(catalog, weights);

    return createGrammar(catalog, {
        weights,
        size: grammar.size,
        shareDepth: grammar.shareDepth,
        space: grammar.space,
    });
}

/** Golden-ratio multiplicative hash: distinct indices give well-separated 32-bit seeds. */
export function deriveSeed(base: number, index: number): Seed {
    return createSeed((Math.imul(index + 1, 0x9e37_79b1) ^ base) >>> 0);
}

/** The image seeds of one sampled item: index-stable, so the whole sample is deterministic. */
export function itemSeeds(baseSeed: number, index: number, seedsPerItem: number): readonly Seed[] {
    return Array.from({ length: seedsPerItem }, (_, k) =>
        deriveSeed(baseSeed ^ 0x5bd1_e995, index * seedsPerItem + k),
    );
}
