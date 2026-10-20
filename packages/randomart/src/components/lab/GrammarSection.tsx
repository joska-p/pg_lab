import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import { COLOR_SPACE_IDS, COLOR_SPACES } from '../../core/color/index.ts';
import {
    ANCHOR_LEVELS,
    FAMILY_IDS,
    grammarPresets,
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
    setRecipeLevel,
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

function levelOptions(family: FamilyId) {
    return (family === 'anchors' ? ANCHOR_LEVELS : WEIGHT_LEVELS).map((level) => ({
        value: level,
        label: level,
    }));
}

/**
 * The grammar workshop: one story. The grammar is a quantized recipe; a preset is a named recipe,
 * and the select reads "Custom" as soon as a knob moves away from every preset.
 */
export function GrammarSection() {
    const recipe = useRecipe();
    const seed = useSeed();

    const presetId = presetIdOf(PRESETS, recipe);
    const preset = PRESETS.find((candidate) => candidate.id === presetId);

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

            {FAMILY_IDS.map((family) => {
                const level = recipe.levels[family];
                const levelIndex = levelOptions(family).findIndex(
                    (option) => option.value === level,
                );
                const numberOfLevels = levelOptions(family).length - 1;

                function handleOnValueChange(newLevel: number) {
                    const newLevelValue = levelOptions(family)[newLevel].value;
                    setRecipeLevel(family, newLevelValue);
                }

                return (
                    <Slider
                        color="orange"
                        key={family}
                        label={FAMILY_LABELS[family]}
                        value={levelIndex}
                        min={0}
                        max={numberOfLevels}
                        onValueChange={handleOnValueChange}
                    />
                );
            })}

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
                label="shareDepth"
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
