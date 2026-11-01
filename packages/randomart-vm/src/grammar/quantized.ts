import { colorSpaceIds } from '../color/registry';
import type { ColorSpaceId } from '../color/registry';
import type { Catalog } from '../isa/catalog';
import { defaultCatalog } from '../isa/default';
import type { Rng } from '../rng/types';
import { constraintsOf, createGrammar, weightOf } from './grammar';
import type { Grammar, SizeProfile } from './types';

export const SIZE_PROFILE_IDS: readonly SizeProfile[] = ['tiny', 'small', 'medium', 'large'];

export function grammarKey(grammar: Grammar, catalog: Catalog = defaultCatalog): string {
    const weights = catalog
        .operators()
        .map((op) => `${op.name}:${weightOf(grammar.weights, op.name)}`);
    return JSON.stringify([weights, grammar.size, grammar.shareDepth, grammar.space]);
}

export interface GrammarPins {
    readonly size?: SizeProfile;
    readonly shareDepth?: number;
    readonly space?: ColorSpaceId;
}

export function drawGrammar(
    rng: Rng,
    pins: GrammarPins = {},
    catalog: Catalog = defaultCatalog,
): Grammar {
    const weights: Record<string, number> = {};
    for (const op of catalog.operators()) {
        weights[op.name] = rng.int(5); // 0..4
    }

    const terminals = catalog.operators().filter((op) => op.isTerminal);
    const nonTerminals = catalog.operators().filter((op) => !op.isTerminal);
    if (!terminals.some((op) => weightOf(weights, op.name) > 0) && terminals[0]) {
        weights[terminals[0].name] = 1;
    }
    if (!nonTerminals.some((op) => weightOf(weights, op.name) > 0) && nonTerminals[0]) {
        weights[nonTerminals[0].name] = 1;
    }

    const size = pins.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)];
    const maxDepth = constraintsOf(size).maxDepth;
    const shareDepth = pins.shareDepth ?? rng.int(maxDepth + 1);
    const space = pins.space ?? colorSpaceIds[rng.int(colorSpaceIds.length)];

    return createGrammar(catalog, { weights, size, shareDepth, space });
}
