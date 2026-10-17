import type { Catalog } from '../catalog/index.ts';
import { RAW_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
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
 * `createGrammar`, constraints and channels have a fixed key order, so equal grammars give equal
 * text. Used to tell which built-in recipe (if any) the current grammar is.
 */
function signature(grammar: Grammar): string {
    return JSON.stringify({
        weights: grammar.weights,
        constraints: grammar.constraints,
        channels: grammar.channels,
    });
}

/**
 * The built-in recipes of the play mode. They all reuse the calibrated `defaultGrammar` weights and
 * differ in their channel model — how the triplet becomes colour (`space`) and how much structure
 * the three channels share (`shareDepth`) are both part of the grammar, so this is a real recipe
 * dimension, not a display option.
 *
 * These are provisional, hand-picked starting points: the recipes actually discovered by the lab
 * (contact sheets, rating, weight adjustment) will extend or replace this list.
 */
export function grammarPresets(catalog: Catalog): readonly GrammarPreset[] {
    const base = defaultGrammar(catalog);
    const withChannels = (channels: ChannelModel): Grammar =>
        createGrammar(catalog, {
            weights: base.weights,
            constraints: base.constraints,
            channels,
        });

    return [
        {
            id: 'structure',
            label: 'Structure',
            description: 'Calibrated default: a shallow shared trunk read as OKLCH.',
            grammar: base,
        },
        {
            id: 'mono',
            label: 'Mono',
            description: 'One fully shared tree: pure greyscale structure.',
            // `shareDepth = maxDepth` means no channel ever diverges, so `r = g = b`.
            grammar: withChannels({ space: 'oklch', shareDepth: base.constraints.maxDepth }),
        },
        {
            id: 'oklab',
            label: 'OKLab',
            description: 'The same shared trunk in OKLab: flatter, more even colour.',
            grammar: withChannels({ space: 'oklab', shareDepth: 2 }),
        },
        {
            id: 'rgb',
            label: 'Raw RGB',
            description: 'Three independent channels in sRGB: colour and shape drift apart.',
            grammar: withChannels(RAW_CHANNELS),
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
