import type { Catalog } from '../catalog/index.ts';
import { CONFIG } from '../config/index.ts';
import { recipeKey, recipeToGrammar } from './quantized.ts';
import type { Recipe, Grammar } from './types.ts';

export interface GrammarPreset {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly recipe: Recipe;
    readonly grammar: Grammar;
}

/**
 * The app's starting point: the 2026-10-17 calibration, snapped onto the weight grid. The field of
 * a generated expression is provably bounded to `[-1, 1]` (every operator preserves the range), and
 * every color space maps it monotonically, so the only thing that flattens an image into an aplat
 * is a _constant_ field — not the mapping and not a final clamp (that clamp is dead). Measuring
 * local flatness against operator presence showed which operators structure the field and which
 * flatten it: `x`/`y`/`max` create variation, while `gt`, `add` and `const` dominate subtrees with
 * a single value. Up-weighting the first and leaving the second at the neutral level roughly halves
 * the share of near-uniform stills (measured on the fuzz corpus: mean local flatness 59% → 41%,
 * near-uniform "aplats" 42% → 19%).
 *
 * Operators absent from `levels` read as `NEUTRAL_LEVEL` (weight 1): the vocabulary is the whole
 * catalog, weighted for _structure_. There is no separate "animated" preset: animation is a matter
 * of playback (the terminals' oscillator params), not of vocabulary.
 */
export const DEFAULT_RECIPE: Recipe = {
    levels: {
        // Spatial anchors: always vary across the image.
        x: '4',
        y: '4',
        // Structure makers.
        max: '2',
        min: '2',
    },
    size: 'medium',
    share: CONFIG.channels.shareDepth,
    space: CONFIG.channels.space,
};

/**
 * The default grammar: the `structure` recipe compiled down. Its color model is a trunk of depth 2
 * read as OKLCH, the _curated_ default — the model that actually yields readable images
 * (`createGrammar` alone would fall back to plain raw sRGB).
 */
export function defaultGrammar(catalog: Catalog): Grammar {
    return recipeToGrammar(catalog, DEFAULT_RECIPE);
}

/** Quantized readings of the calibrated default: the app's starting point and its variants. */
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
        recipe: DEFAULT_RECIPE,
    },
    {
        id: 'mono',
        label: 'Mono',
        description: 'One fully shared tree: pure greyscale structure.',
        recipe: { ...DEFAULT_RECIPE, share: 'mono' },
    },
    {
        id: 'oklab',
        label: 'OKLab',
        description: 'The same shared trunk in OKLab: flatter, more even color.',
        recipe: { ...DEFAULT_RECIPE, space: 'oklab' },
    },
    {
        id: 'rgb',
        label: 'Raw RGB',
        description: 'Three independent channels in sRGB: color and shape drift apart.',
        recipe: { ...DEFAULT_RECIPE, share: 0, space: 'srgb' },
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
