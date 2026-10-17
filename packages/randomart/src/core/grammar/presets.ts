import type { Catalog } from '../catalog/index.ts';
import { UNRELATED_COLOR } from '../color/index.ts';
import type { ColorModel } from '../color/index.ts';
import { createGrammar, defaultGrammar } from './grammar.ts';
import type { Grammar } from './types.ts';

export interface GrammarPreset {
    readonly id: string;
    readonly label: string;
    /** One line for the UI: what this recipe is for. */
    readonly description: string;
    readonly grammar: Grammar;
}

/**
 * Canonical text of a grammar for identity comparison. Weights are already sorted by
 * `createGrammar`, constraints have a fixed key order, so equal grammars give equal text. Used to
 * tell which built-in recipe (if any) the current grammar is.
 */
function signature(grammar: Grammar): string {
    return JSON.stringify({
        weights: grammar.weights,
        constraints: grammar.constraints,
        color: grammar.color,
    });
}

/**
 * The built-in recipes of the play mode. They all reuse the calibrated `defaultGrammar` weights and
 * differ in their colour model — colour is part of the grammar (it decides how the field becomes an
 * image), so this is a real recipe dimension, not a display option.
 *
 * These are provisional, hand-picked starting points: the recipes actually discovered by the lab
 * (contact sheets, rating, weight adjustment) will extend or replace this list.
 */
export function grammarPresets(catalog: Catalog): readonly GrammarPreset[] {
    const base = defaultGrammar(catalog);
    const withColor = (color: ColorModel): Grammar =>
        createGrammar(catalog, {
            weights: base.weights,
            constraints: base.constraints,
            color,
        });

    return [
        {
            id: 'structure',
            label: 'Structure',
            description: 'Calibrated default: one field through the spectrum palette.',
            grammar: base,
        },
        {
            id: 'mono',
            label: 'Mono',
            description: 'The same field in greyscale: pure structure.',
            grammar: withColor({ kind: 'correlated', palette: 'mono' }),
        },
        {
            id: 'ember',
            label: 'Ember',
            description: 'The same field through a warm palette.',
            grammar: withColor({ kind: 'correlated', palette: 'ember' }),
        },
        {
            id: 'rgb',
            label: 'Raw RGB',
            description: 'Three independent channels: colour and shape drift apart.',
            grammar: withColor(UNRELATED_COLOR),
        },
    ];
}

/** The id of the preset the grammar matches exactly, or `undefined` for a custom grammar. */
export function presetIdOf(
    presets: readonly GrammarPreset[],
    grammar: Grammar,
): string | undefined {
    const text = signature(grammar);

    return presets.find((preset) => signature(preset.grammar) === text)?.id;
}
