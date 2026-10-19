import type { Catalog } from '../catalog/index.ts';
import { TUNING } from '../config/index.ts';
import { recipeKey, recipeToGrammar } from './quantized.ts';
import type { Recipe } from './quantized.ts';
import type { Grammar } from './types.ts';

export interface GrammarPreset {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly recipe: Recipe;
    readonly grammar: Grammar;
}

/** Quantized reading of the calibrated default: the app's starting point. */
export const STRUCTURE_RECIPE: Recipe = {
    levels: {
        anchors: 'high',
        extrema: 'high',
        arithmetic: 'low',
        trigonometry: 'normal',
        logic: 'low',
        warp: 'low',
    },
    size: 'medium',
    share: TUNING.channels.defaultShareDepth,
    space: TUNING.channels.defaultSpace,
};

export function grammarSignature(grammar: Grammar): string {
    return JSON.stringify({
        weights: grammar.weights,
        constraints: grammar.constraints,
        channels: grammar.channels,
    });
}

export const PRESET_RECIPES: readonly {
    id: string;
    label: string;
    description: string;
    recipe: Recipe;
}[] = [
    {
        id: 'structure',
        label: 'Structure',
        description: 'Calibrated start: a shallow shared trunk read as OKLCH.',
        recipe: STRUCTURE_RECIPE,
    },
    {
        id: 'mono',
        label: 'Mono',
        description: 'One fully shared tree: pure greyscale structure.',
        recipe: { ...STRUCTURE_RECIPE, share: 'mono' },
    },
    {
        id: 'oklab',
        label: 'OKLab',
        description: 'The same shared trunk in OKLab: flatter, more even colour.',
        recipe: { ...STRUCTURE_RECIPE, space: 'oklab' },
    },
    {
        id: 'rgb',
        label: 'Raw RGB',
        description: 'Three independent channels in sRGB: colour and shape drift apart.',
        recipe: { ...STRUCTURE_RECIPE, share: 0, space: 'srgb' },
    },
];

export function grammarPresets(catalog: Catalog): readonly GrammarPreset[] {
    return PRESET_RECIPES.map((preset) => ({
        ...preset,
        grammar: recipeToGrammar(catalog, preset.recipe),
    }));
}

/** The id of the preset the recipe equals, or `undefined`: the select then reads "Custom". */
export function presetIdOf(presets: readonly GrammarPreset[], recipe: Recipe): string | undefined {
    const key = recipeKey(recipe);

    return presets.find((preset) => recipeKey(preset.recipe) === key)?.id;
}
