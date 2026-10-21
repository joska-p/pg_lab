import type { OperatorId } from '../catalog/operators/registry';
import type { ColorSpaceId, SizeProfileId } from '../config/types';
import { createGrammar } from './grammar';
import { grammarKey } from './quantized';
import type { Grammar, GrammarPreset } from './types';

/**
 * A preset as plain data, the shape of a grammar found by the bench or the dataset: paste it as-is.
 * Weights are exhaustive on purpose (`Record<OperatorId, number>`): a preset is readable in full,
 * and adding an operator to the catalog fails to compile here until every preset states its
 * weight.
 */
interface PresetData {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly grammar: {
        readonly weights: Readonly<Record<OperatorId, number>>;
        readonly size: SizeProfileId;
        readonly shareDepth: number;
        readonly space: ColorSpaceId;
    };
}

/** The curated catalog. Every grammar the bench keeps is appended here, whole and readable. */
const PRESET_DATA: readonly PresetData[] = [
    {
        id: 'structure',
        label: 'Structure',
        description:
            'First grammar kept: x/y dominate, min/max structure the field, the rest is neutral.',
        grammar: {
            weights: {
                abs: 1,
                add: 1,
                const: 1,
                cos: 1,
                div: 1,
                gt: 1,
                max: 2,
                min: 2,
                mix: 1,
                mul: 1,
                neg: 1,
                select: 1,
                sin: 1,
                sqr: 1,
                warp: 1,
                x: 4,
                y: 4,
            },
            size: 'medium',
            shareDepth: 2,
            space: 'oklch',
        },
    },
];

/** The catalog as domain grammars, each validated by `createGrammar` at module load. */
export const GRAMMAR_PRESETS: readonly GrammarPreset[] = PRESET_DATA.map(
    ({ id, label, description, grammar }) => ({
        id,
        label,
        description,
        grammar: createGrammar(grammar),
    }),
);

/** The id of the preset the grammar equals, or `undefined`: the select then reads "Custom". */
export function presetIdOf(grammar: Grammar): string | undefined {
    const key = grammarKey(grammar);

    return GRAMMAR_PRESETS.find((preset) => grammarKey(preset.grammar) === key)?.id;
}
