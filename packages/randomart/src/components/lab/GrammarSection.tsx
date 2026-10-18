import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';

import { COLOR_SPACE_IDS, COLOR_SPACES } from '../../core/color/index.ts';
import type { ColorSpaceId } from '../../core/color/index.ts';
import {
    FAMILY_IDS,
    grammarPresets,
    PROFILE_IDS,
    presetIdOf,
    SHARE_CHOICES,
    WEIGHT_LEVELS,
} from '../../core/grammar/index.ts';
import type {
    FamilyId,
    ShareChoice,
    SizeProfileId,
    WeightLevel,
} from '../../core/grammar/index.ts';
import { MOTION_LEVELS } from '../../core/motion/index.ts';
import type { MotionLevel } from '../../core/motion/index.ts';
import {
    applyRecipe,
    newGrammar,
    setRecipeLevel,
    setRecipeMotion,
    setRecipeShare,
    setRecipeSize,
    setRecipeSpace,
    useRecipe,
} from '../../stores/appStore';
import { catalog } from '../../stores/catalogueStore.ts';

const PRESETS = grammarPresets(catalog);
const CUSTOM_ID = 'custom';
const PRESET_OPTIONS = [
    ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
    { value: CUSTOM_ID, label: 'Custom' },
];

const FAMILY_LABELS: Record<FamilyId, string> = {
    anchors: 'anchors (x, y)',
    extrema: 'min / max',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    warp: 'warp',
};
const ANCHOR_LEVELS: readonly WeightLevel[] = ['normal', 'high'];

const SIZE_OPTIONS = PROFILE_IDS.map((id) => ({ value: id, label: id }));
const SHARE_OPTIONS = SHARE_CHOICES.map((choice) => ({
    value: String(choice),
    label: String(choice),
}));
const SPACE_OPTIONS = COLOR_SPACE_IDS.map((id) => ({ value: id, label: COLOR_SPACES[id].label }));
const MOTION_OPTIONS = MOTION_LEVELS.map((level) => ({
    value: level,
    label: level,
}));

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
    const presetId = presetIdOf(PRESETS, recipe);
    const preset = PRESETS.find((candidate) => candidate.id === presetId);

    return (
        <Grid columns="1" gap="3">
            <Grid columns="2" gap="2">
                <Select
                    title={preset?.description ?? 'A recipe that is not one of the presets.'}
                    value={presetId ?? CUSTOM_ID}
                    options={PRESET_OPTIONS}
                    onValueChange={(id) => {
                        const chosen = PRESETS.find((candidate) => candidate.id === id);

                        if (chosen) {
                            applyRecipe(chosen.recipe);
                        }
                    }}
                />

                <Button
                    color="aqua"
                    onClick={() => {
                        newGrammar();
                    }}
                >
                    new
                </Button>
            </Grid>

            <Grid columns="2" gap="2">
                {FAMILY_IDS.map((family) => (
                    <Select<WeightLevel>
                        key={family}
                        label={FAMILY_LABELS[family]}
                        value={recipe.levels[family]}
                        options={levelOptions(family)}
                        onValueChange={(level) => {
                            setRecipeLevel(family, level);
                        }}
                    />
                ))}
            </Grid>

            <Grid columns="2" gap="2">
                <Select<SizeProfileId>
                    label="size"
                    value={recipe.size}
                    options={SIZE_OPTIONS}
                    onValueChange={setRecipeSize}
                />
                <Select
                    label="shareDepth"
                    value={String(recipe.share)}
                    options={SHARE_OPTIONS}
                    onValueChange={(value) => {
                        setRecipeShare(value === 'mono' ? 'mono' : (Number(value) as ShareChoice));
                    }}
                />
            </Grid>

            <Grid columns="2" gap="2">
                <Select<ColorSpaceId>
                    label="color"
                    value={recipe.space}
                    options={SPACE_OPTIONS}
                    onValueChange={setRecipeSpace}
                />
                <Select<MotionLevel>
                    label="motion"
                    value={recipe.motion}
                    options={MOTION_OPTIONS}
                    onValueChange={setRecipeMotion}
                />
            </Grid>
        </Grid>
    );
}
