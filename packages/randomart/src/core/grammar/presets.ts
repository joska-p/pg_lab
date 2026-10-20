import type { Catalog, OperatorId } from '../catalog/index.ts';
import { DEFAULT_CHANNELS } from '../color/index.ts';
import type { ColorSpaceId } from '../color/index.ts';
import { CONFIG } from '../config/index.ts';
import { constraintsOf, createGrammar } from './grammar.ts';
import { grammarKey } from './quantized.ts';
import type { Grammar } from './types.ts';

export interface GrammarPreset {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly grammar: Grammar;
}

/**
 * The 2026-10-17 calibration, expressed on the weight axis. Measuring local flatness against
 * operator presence showed which operators structure the field and which flatten it: `x`/`y`/`max`
 * create variation, while `gt`, `add` and `const` dominate subtrees with a single value.
 * Up-weighting the first and leaving the second at the neutral weight roughly halves the share of
 * near-uniform stills (measured on the fuzz corpus: mean local flatness 59% → 41%, near-uniform
 * "aplats" 42% → 19%).
 *
 * Every other operator stays at the neutral weight 1: the vocabulary is the whole catalog, weighted
 * for _structure_. Animation is a matter of playback (the terminals' oscillator params), not of
 * vocabulary.
 */
const CALIBRATION: Readonly<Partial<Record<OperatorId, number>>> = {
    x: CONFIG.grammar.maxWeight,
    y: CONFIG.grammar.maxWeight,
    max: Math.min(2, CONFIG.grammar.maxWeight),
    min: Math.min(2, CONFIG.grammar.maxWeight),
};

/** The full catalog at the neutral weight, with the calibration applied. */
function calibratedWeights(catalog: Catalog): Record<OperatorId, number> {
    const weights = {} as Record<OperatorId, number>;

    for (const operator of catalog.operators()) {
        weights[operator.name as OperatorId] = 1;
    }

    return Object.assign(weights, CALIBRATION);
}

/** The default grammar: the calibrated start, a medium grammar in the curated channel model. */
export function defaultGrammar(catalog: Catalog): Grammar {
    return createGrammar(catalog, {
        weights: calibratedWeights(catalog),
        size: 'medium',
        shareDepth: DEFAULT_CHANNELS.shareDepth,
        space: DEFAULT_CHANNELS.space,
    });
}

function preset(
    catalog: Catalog,
    id: string,
    label: string,
    description: string,
    shareDepth: number,
    space: ColorSpaceId,
): GrammarPreset {
    return {
        id,
        label,
        description,
        grammar: createGrammar(catalog, {
            weights: calibratedWeights(catalog),
            size: 'medium',
            shareDepth,
            space,
        }),
    };
}

/** Named grammars: the app's starting point and its channel-model variants. */
export function grammarPresets(catalog: Catalog): readonly GrammarPreset[] {
    const monoShareDepth = constraintsOf('medium').maxDepth;

    return [
        preset(
            catalog,
            'structure',
            'Structure',
            'Calibrated start: a shallow shared trunk read as OKLCH.',
            DEFAULT_CHANNELS.shareDepth,
            DEFAULT_CHANNELS.space,
        ),
        preset(
            catalog,
            'mono',
            'Mono',
            'One fully shared tree: pure greyscale structure.',
            monoShareDepth,
            DEFAULT_CHANNELS.space,
        ),
        preset(
            catalog,
            'oklab',
            'OKLab',
            'The same shared trunk in OKLab: flatter, more even color.',
            DEFAULT_CHANNELS.shareDepth,
            'oklab',
        ),
        preset(
            catalog,
            'rgb',
            'Raw RGB',
            'Three independent channels in sRGB: color and shape drift apart.',
            0,
            'srgb',
        ),
    ];
}

/** The id of the preset the grammar equals, or `undefined`: the select then reads "Custom". */
export function presetIdOf(
    catalog: Catalog,
    presets: readonly GrammarPreset[],
    grammar: Grammar,
): string | undefined {
    const key = grammarKey(catalog, grammar);

    return presets.find((preset) => grammarKey(catalog, preset.grammar) === key)?.id;
}
