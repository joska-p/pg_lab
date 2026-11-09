import { getGrammarPreset, GRAMMAR_PRESETS, presetOf } from '@repo/randomart-core/grammar';
import type { GrammarPreset, GrammarPresetId } from '@repo/randomart-core/grammar';
import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';

import { applyPreset, randomizeGrammar, useGrammar } from '../../stores/artworkStore';
import { setMode } from '../../stores/modeStore';

const CUSTOM_PRESET = {
    id: 'custom',
    label: 'Custom',
    description: 'Edit the grammar by hand in the lab.',
} as const satisfies Partial<GrammarPreset>;

type PresetOptionValue = GrammarPresetId | typeof CUSTOM_PRESET.id;

const PRESET_OPTIONS: readonly { value: PresetOptionValue; label: string }[] = [
    ...GRAMMAR_PRESETS.map(({ id, label }) => ({ value: id, label })),
    { value: CUSTOM_PRESET.id, label: CUSTOM_PRESET.label },
];

export function GrammarSelect() {
    const grammar = useGrammar();
    const presetId = presetOf(grammar);
    const preset = presetId ? getGrammarPreset(presetId) : CUSTOM_PRESET;

    return (
        <ControlField label="Grammar">
            <Grid columns="2" gap="2">
                <Select<PresetOptionValue>
                    aria-label="grammar preset"
                    title={preset.description}
                    value={presetId ?? CUSTOM_PRESET.id}
                    options={PRESET_OPTIONS}
                    onValueChange={(id) => {
                        if (id === CUSTOM_PRESET.id) {
                            // The custom editor lives in the lab panel; selecting Custom means
                            // "stop using a preset and edit the grammar", not a grammar change.
                            setMode('lab');
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
