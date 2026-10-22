import { catalog } from '../catalog/default';
import type { Operator } from '../catalog/operators/Operator';
import type { OperatorId } from '../catalog/types';
import { colorSpaceIds } from '../color/registry';
import { CONFIG } from '../config/config';
import type { SizeProfileId } from '../config/types';
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

/** Quantized grammar space: weights are integers in [0, maxWeight]; size profile fixes constraints. */

export const SIZE_PROFILE_IDS = Object.keys(
    CONFIG.grammar.sizeProfiles,
) as readonly SizeProfileId[];

/** Stable identity, for deduplication, caches and preset matching. */
export function grammarKey(grammar: Grammar): string {
    const weights = catalog
        .operators()
        .map((operator) => `${operator.name}:${weightOf(grammar.weights, operator.name)}`);

    return JSON.stringify([weights, grammar.size, grammar.shareDepth, grammar.space]);
}

/** Raises first operator to weight 1 when all are off. */
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

/** Ensures at least one terminal and one non-terminal are active (repair is deterministic, no PRNG). */
function ensureUsableVocabulary(weights: Partial<Record<OperatorId, number>>): void {
    ensureActive(weights, catalog.operators().filter(isTerminalOperator));
    ensureActive(weights, catalog.operators().filter(isNonTerminalOperator));
}

/**
 * Random point in grammar space: uniform weight per operator, then size/share/color axes. Pins
 * replace axes.
 */
export function drawGrammar(rng: Rng, pins: GrammarPins = {}): Grammar {
    const weights: Partial<Record<OperatorId, number>> = {};

    for (const operator of catalog.operators()) {
        weights[operator.name as OperatorId] = rng.int(CONFIG.grammar.maxWeight + 1);
    }

    ensureUsableVocabulary(weights);

    const size = pins.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)];
    const maxDepth = constraintsOf(size).maxDepth;
    const shareDepth = pins.shareDepth ?? rng.int(maxDepth + 1);
    const space = pins.space ?? colorSpaceIds[rng.int(colorSpaceIds.length)];

    return createGrammar({ weights, size, shareDepth, space });
}

/** Golden-ratio hash: distinct indices give well-separated 32-bit seeds. */
export function deriveSeed(base: number, index: number): Seed {
    return createSeed((Math.imul(index + 1, 0x9e37_79b1) ^ base) >>> 0);
}

/** Image seeds for one sampled item: index-stable for deterministic sampling. */
export function itemSeeds(baseSeed: number, index: number, seedsPerItem: number): readonly Seed[] {
    return Array.from({ length: seedsPerItem }, (_, k) =>
        deriveSeed(baseSeed ^ 0x5bd1_e995, index * seedsPerItem + k),
    );
}
