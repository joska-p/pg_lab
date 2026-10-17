import { Button } from '@repo/ui/components/Button';
import { FileInput } from '@repo/ui/components/FileInput';
import { NumberField } from '@repo/ui/components/NumberField';
import { Select } from '@repo/ui/components/Select';
import { Stack } from '@repo/ui/components/Stack';

import { COLOR_SPACE_IDS, COLOR_SPACES, MIN_SHARE_DEPTH } from '../../core/color/index.ts';
import type { ColorSpaceId } from '../../core/color/index.ts';
import { MAX_DEPTH, MAX_NODES, grammarPresets, presetIdOf } from '../../core/grammar/index.ts';
import {
    applyGrammar,
    exportGrammarFile,
    importGrammarFile,
    newDistribution,
    resetGrammar,
    setChannels,
    setConstraints,
    useGrammar,
} from '../../stores/appStore';
import { catalog } from '../../stores/catalogueStore.ts';

const PRESETS = grammarPresets(catalog);
const CUSTOM_PRESET = {
    id: 'custom',
    label: 'Custom',
    description: 'Your own grammar, with custom weights and constraints.',
    grammar: null,
};
const RECIPE_OPTIONS = [
    ...PRESETS.map((preset) => ({
        value: preset.id,
        label: preset.label,
    })),
    { value: CUSTOM_PRESET.id, label: CUSTOM_PRESET.label },
];

/**
 * The grammar workshop: recipe presets, structural constraints, channel sharing, and grammar-level
 * serialization actions.
 */
export function GrammarSection() {
    const grammar = useGrammar();

    const currentPresetId = presetIdOf(PRESETS, grammar);
    const currentPreset = PRESETS.find((preset) => preset.id === currentPresetId) ?? CUSTOM_PRESET;

    return (
        <Stack gap="3">
            {/* ── Recipe presets ── */}
            <Select
                title={currentPreset?.description}
                value={currentPresetId ?? CUSTOM_PRESET.id}
                options={RECIPE_OPTIONS}
                onValueChange={(id) => {
                    const preset = PRESETS.find((candidate) => candidate.id === id);
                    if (preset) {
                        applyGrammar(preset.grammar);
                    }
                }}
            />

            {/* ── Grammar actions & summary ── */}
            <Stack gap="2">
                <Stack direction="horizontal" gap="2">
                    <Button
                        onClick={() => {
                            newDistribution();
                        }}
                    >
                        New weights
                    </Button>
                    <Button
                        onClick={() => {
                            resetGrammar();
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            exportGrammarFile();
                        }}
                    >
                        Export
                    </Button>
                    <FileInput
                        accept=".json,application/json"
                        onFile={(file) => {
                            void importGrammarFile(file);
                        }}
                    >
                        Import
                    </FileInput>
                </Stack>
            </Stack>

            {/* ── Tree constraints ── */}
            <Stack direction="horizontal" gap="2">
                <NumberField
                    label="minDepth"
                    min={1}
                    max={MAX_DEPTH}
                    value={grammar.constraints.minDepth}
                    onValueChange={(value) => {
                        setConstraints({ minDepth: value });
                    }}
                />
                <NumberField
                    label="maxDepth"
                    min={1}
                    max={MAX_DEPTH}
                    value={grammar.constraints.maxDepth}
                    onValueChange={(value) => {
                        setConstraints({ maxDepth: value });
                    }}
                />
                <NumberField
                    label="maxNodes"
                    min={1}
                    max={MAX_NODES}
                    value={grammar.constraints.maxNodes}
                    onValueChange={(value) => {
                        setConstraints({ maxNodes: value });
                    }}
                />
            </Stack>

            {/* ── Channels ── */}
            <Stack gap="2" direction="horizontal">
                <Select<ColorSpaceId>
                    label="color space"
                    value={grammar.channels.space}
                    options={COLOR_SPACE_IDS.map((id) => ({
                        value: id,
                        label: COLOR_SPACES[id].label,
                    }))}
                    onValueChange={(space) => setChannels({ ...grammar.channels, space })}
                />
                <NumberField
                    label="shareDepth"
                    min={MIN_SHARE_DEPTH}
                    max={grammar.constraints.maxDepth}
                    value={grammar.channels.shareDepth}
                    onValueChange={(shareDepth) => setChannels({ ...grammar.channels, shareDepth })}
                />
            </Stack>
        </Stack>
    );
}
