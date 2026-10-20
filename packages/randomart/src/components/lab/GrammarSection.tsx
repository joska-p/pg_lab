import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { Text } from '@repo/ui/components/Text';
import { TextInput } from '@repo/ui/components/TextInput';

import type { OperatorId } from '../../core/catalog/index.ts';
import { COLOR_SPACE_IDS, COLOR_SPACES } from '../../core/color/index.ts';
import {
    ANCHOR_OPERATORS,
    FAMILY_IDS,
    FAMILY_OPERATORS,
    grammarPresets,
    isLastTerminal,
    levelIndexOf,
    levelOf,
    NEUTRAL_LEVEL,
    OFF_LEVEL,
    recipeWeights,
    SIZE_PROFILE_IDS,
    presetIdOf,
    SHARE_CHOICES,
    WEIGHT_LEVELS,
} from '../../core/grammar/index.ts';
import type { FamilyId } from '../../core/grammar/index.ts';
import { createSeed } from '../../core/random/index.ts';
import {
    applyRecipe,
    resetSeed,
    drawGrammar,
    setRecipeOperator,
    setRecipeShare,
    setRecipeSize,
    setRecipeSpace,
    useRecipe,
    useSeed,
} from '../../stores/appStore.ts';
import { catalog } from '../../stores/catalogStore.ts';

const PRESETS = grammarPresets(catalog);
const CUSTOM_PRESET = 'custom';
const PRESET_OPTIONS = [
    ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
    { value: CUSTOM_PRESET, label: 'Custom' },
];

const FAMILY_LABELS: Record<FamilyId, string> = {
    anchors: 'anchors (x, y)',
    extrema: 'min / max',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    warp: 'warp',
};

const SPACE_OPTIONS = COLOR_SPACE_IDS.map((id) => ({ value: id, label: COLOR_SPACES[id].label }));

const MAX_LEVEL_INDEX = WEIGHT_LEVELS.length - 1;

/**
 * The grammar workshop: one story. The grammar is a point of the quantized grid — one weight level
 * per operator — a preset is a named recipe, and the select reads "Custom" as soon as a knob moves
 * away from every preset. A slider whose lowest notch would break a structural invariant (the last
 * active terminal, the last live anchor) starts at the first valid notch.
 */
export function GrammarSection() {
    const recipe = useRecipe();
    const seed = useSeed();

    const presetId = presetIdOf(PRESETS, recipe);
    const preset = PRESETS.find((candidate) => candidate.id === presetId);
    const weights = recipeWeights(recipe);

    function mustStayOn(name: OperatorId): boolean {
        const lastAnchor =
            ANCHOR_OPERATORS.includes(name) &&
            ANCHOR_OPERATORS.filter((other) => other !== name).every(
                (other) => levelOf(recipe, other) === OFF_LEVEL,
            );

        return lastAnchor || isLastTerminal(catalog, weights, name);
    }

    return (
        <Grid columns="1" gap="3" justifyItem="stretch" alignItem="stretch">
            <Grid columns="2" gap="2">
                <TextInput
                    title="type a seed number"
                    value={String(seed)}
                    onValueChange={(value) => {
                        resetSeed(createSeed(Number(value)));
                    }}
                />
                <Button
                    title="generate a new random seed"
                    color="solder"
                    onClick={() => {
                        resetSeed();
                    }}
                >
                    ⟳
                </Button>

                <Select
                    title={preset?.description ?? 'A recipe that is not one of the presets.'}
                    value={presetId ?? CUSTOM_PRESET}
                    options={PRESET_OPTIONS}
                    onValueChange={(id) => {
                        const chosen = PRESETS.find((candidate) => candidate.id === id);

                        if (chosen) {
                            applyRecipe(chosen.recipe);
                        }
                    }}
                />

                <Button
                    title="generate a new random grammar"
                    color="orange"
                    onClick={() => {
                        drawGrammar();
                    }}
                >
                    ⟳
                </Button>
            </Grid>

            {FAMILY_IDS.map((family) => (
                <Grid key={family} columns="1" gap="1" justifyItem="stretch" alignItem="stretch">
                    <Text>{FAMILY_LABELS[family]}</Text>

                    {FAMILY_OPERATORS[family].map((name) => (
                        <Slider
                            color="orange"
                            key={name}
                            label={name}
                            value={levelIndexOf(levelOf(recipe, name))}
                            min={mustStayOn(name) ? 1 : 0}
                            max={MAX_LEVEL_INDEX}
                            onValueChange={(index) => {
                                setRecipeOperator(name, WEIGHT_LEVELS[index] ?? NEUTRAL_LEVEL);
                            }}
                        />
                    ))}
                </Grid>
            ))}

            <Slider
                color="orange"
                label="size"
                value={SIZE_PROFILE_IDS.indexOf(recipe.size)}
                min={0}
                max={SIZE_PROFILE_IDS.length - 1}
                onValueChange={(value) => setRecipeSize(SIZE_PROFILE_IDS[value])}
            />

            <Slider
                color="orange"
                label="share"
                value={SHARE_CHOICES.indexOf(recipe.share)}
                min={0}
                max={SHARE_CHOICES.length - 1}
                onValueChange={(value) => setRecipeShare(SHARE_CHOICES[value])}
            />

            <Segmented
                color="orange"
                label="color"
                value={recipe.space}
                options={SPACE_OPTIONS}
                onValueChange={setRecipeSpace}
            />
        </Grid>
    );
}
