import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import { grammarPresets, presetIdOf } from '../../core/grammar/index.ts';
import {
    applyGrammar,
    exportPng,
    newImage,
    useActionError,
    useCanvas,
    useClockStore,
    useCompiledShader,
    useGrammar,
    useHasClockStore,
    useSeed,
    useShaderError,
} from '../../stores/appStore';
import { catalog } from '../../stores/catalogueStore.ts';

/**
 * The built-in recipes, computed once: `randomGrammar`/`grammarPresets` are pure and the catalog is
 * the app-wide singleton.
 */
const PRESETS = grammarPresets(catalog);
const RECIPE_OPTIONS = [...PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))];

/**
 * The play (toy) panel: the immediate gesture — generate, shuffle, pick a recipe, watch, keep. The
 * grammar internals (vocabulary, constraints, history, files, inspector) live in the lab panel.
 */
export function PlayPanel() {
    const seed = useSeed();
    const grammar = useGrammar();
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const compiledShader = useCompiledShader();
    const canvas = useCanvas();
    const actionError = useActionError();
    const shaderError = useShaderError();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    const canAnimate = hasClockStore && compiledShader.animated;
    const currentPresetId = presetIdOf(PRESETS, grammar);
    const currentPreset = PRESETS.find((preset) => preset.id === currentPresetId);

    return (
        <ControlSection title="randomart">
            <Stack gap="3">
                {/* ── Image ── */}
                <ControlField label="Image">
                    <Stack gap="2">
                        <Button
                            onClick={() => {
                                newImage();
                            }}
                        >
                            New image
                        </Button>
                        <Text variant="muted">
                            Seed: {seed} • {compiledShader.stats.nodes} nodes
                        </Text>
                    </Stack>
                </ControlField>

                {/* ── Recipe: a saved grammar, including the calibrated default ── */}
                <ControlField label="Recipe">
                    <Stack gap="2">
                        <Select
                            value={currentPresetId}
                            options={RECIPE_OPTIONS}
                            onValueChange={(id) => {
                                const preset = PRESETS.find((candidate) => candidate.id === id);

                                if (preset) {
                                    applyGrammar(preset.grammar);
                                }
                            }}
                        />
                        <Text variant="muted">{currentPreset?.description}</Text>
                    </Stack>
                </ControlField>

                {/* ── Playback ── */}
                <ControlField label="Playback">
                    <Stack direction="horizontal" gap="2">
                        <Button
                            onClick={() => {
                                clockStore.togglePlay();
                            }}
                            disabled={!canAnimate}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                            onClick={() => {
                                clockStore.reset();
                            }}
                            disabled={!canAnimate}
                        >
                            Reset
                        </Button>
                    </Stack>
                </ControlField>

                {/* ── Export ── */}
                <ControlField label="Export">
                    <Button
                        onClick={() => {
                            void exportPng();
                        }}
                        disabled={!canvas}
                    >
                        Export PNG
                    </Button>
                </ControlField>

                {/* ── Status ── */}
                {actionError ? (
                    <ControlField label="Error">
                        <Text>{actionError}</Text>
                    </ControlField>
                ) : null}
                {shaderError ? (
                    <ControlField label="Shader Error">
                        <Text>
                            [{shaderError.stage}] {shaderError.message}
                        </Text>
                    </ControlField>
                ) : null}
            </Stack>
        </ControlSection>
    );
}
