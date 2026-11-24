import { getGrammarPreset, GRAMMAR_PRESETS, presetOf } from '@repo/randomart-core/grammar';
import type { GrammarPreset, GrammarPresetId } from '@repo/randomart-core/grammar';
import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';

import { applyPreset, randomizeGrammar, useGrammar } from '../../stores/artworkStore';

const CUSTOM_PRESET = {
    id: 'custom',
    label: 'Custom',
    description: 'Edit the grammar by hand in the fine controls below.',
} as const satisfies Partial<GrammarPreset>;

type PresetOptionValue = GrammarPresetId | typeof CUSTOM_PRESET.id;

const PRESET_OPTIONS: readonly { value: PresetOptionValue; label: string }[] = GRAMMAR_PRESETS.map(
    ({ id, label }) => ({ value: id, label }),
);

const CUSTOM_OPTION = { value: CUSTOM_PRESET.id, label: CUSTOM_PRESET.label } as const;

export function GrammarSelect() {
    const grammar = useGrammar();
    const presetId = presetOf(grammar);
    const preset = presetId ? getGrammarPreset(presetId) : CUSTOM_PRESET;

    // "Custom" is a status, not a choice: only offer it while the grammar is actually custom.
    // Presets stay listed so the user can always jump back to one.
    const options: readonly { value: PresetOptionValue; label: string }[] =
        presetId === undefined ? [...PRESET_OPTIONS, CUSTOM_OPTION] : PRESET_OPTIONS;

    return (
        <ControlField label="Grammar">
            <Grid columns="2" gap="2">
                <Select<PresetOptionValue>
                    aria-label="grammar preset"
                    title={preset.description}
                    value={presetId ?? CUSTOM_PRESET.id}
                    options={options}
                    onValueChange={(id) => {
                        if (id === CUSTOM_PRESET.id) {
                            return;
                        }

                        // Applying a preset keeps the current seed and applies its suggested space.
                        applyPreset(getGrammarPreset(id));
                    }}
                />

                <Button
                    title="draw a new random grammar"
                    color="orange"
                    onClick={() => {
                        randomizeGrammar();
                    }}
                >
                    random
                </Button>
            </Grid>
        </ControlField>
    );
}
