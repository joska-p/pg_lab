import { grammarRegistry, presetOf } from '@repo/randomart-core/grammar';
import type { GrammarRegistryId } from '@repo/randomart-core/grammar';
import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';

import { applyGrammar, drawGrammar, useGrammar } from '../../stores/artworkStore';

const CUSTOM_PRESET = {
    id: 'custom',
    label: 'Custom',
    description: 'A grammar that is not one of the presets.',
} as const;

type PresetOptionValue = GrammarRegistryId | typeof CUSTOM_PRESET.id;

const PRESET_OPTIONS: readonly { value: PresetOptionValue; label: string }[] = [
    ...(Object.keys(grammarRegistry) as GrammarRegistryId[]).map((id) => ({
        value: id,
        label: grammarRegistry[id].label,
    })),
    { value: CUSTOM_PRESET.id, label: CUSTOM_PRESET.label },
];

export function GrammarSelect() {
    const grammar = useGrammar();
    const presetId = presetOf(grammar);
    const preset = presetId ? grammarRegistry[presetId] : CUSTOM_PRESET;

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
                            return;
                        }

                        // Applying a preset keeps the current seed.
                        applyGrammar(grammarRegistry[id]);
                    }}
                />

                <Button
                    title="draw a new random grammar"
                    color="orange"
                    onClick={() => {
                        drawGrammar();
                    }}
                >
                    random
                </Button>
            </Grid>
        </ControlField>
    );
}
