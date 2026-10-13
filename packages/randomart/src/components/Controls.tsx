import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import {
    exportPng,
    parseDurationInput,
    regenerate,
    setDuration,
    setGrammarMode,
    useCanvas,
    useClockStore,
    useCompiledShader,
    useDuration,
    useGrammarMode,
    useHasClockStore,
    useSeed,
    useShaderError,
} from '../stores/appStore';

export function Controls() {
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const shaderError = useShaderError();
    const seed = useSeed();
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const grammarMode = useGrammarMode();
    const canvas = useCanvas();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    return (
        <ControlSection title="randomart">
            <Stack gap="3">
                {/* ── Artwork ── */}
                <ControlField label="Artwork">
                    <Stack gap="2">
                        <Stack direction="horizontal" gap="2">
                            <Button
                                onClick={() => {
                                    regenerate();
                                }}
                            >
                                Regenerate
                            </Button>
                            <Button
                                onClick={() => {
                                    setGrammarMode(
                                        grammarMode === 'animated' ? 'static' : 'animated',
                                    );
                                }}
                            >
                                {grammarMode === 'animated' ? '🎞 Animated' : '🖼 Static'}
                            </Button>
                        </Stack>
                        <Text variant="muted">
                            Seed: {seed} • {compiledShader.stats.nodes} nodes
                        </Text>
                    </Stack>
                </ControlField>

                {/* ── Playback ── */}
                <ControlField label="Playback">
                    <Stack gap="2">
                        <Stack direction="horizontal" gap="2">
                            <Button
                                onClick={() => {
                                    clockStore.togglePlay();
                                }}
                                disabled={!hasClockStore}
                            >
                                {isPlaying ? 'Pause' : 'Play'}
                            </Button>
                            <Button
                                onClick={() => {
                                    clockStore.reset();
                                }}
                                disabled={!hasClockStore}
                            >
                                Reset
                            </Button>
                        </Stack>
                        <Stack direction="horizontal" gap="2">
                            <Text variant="muted">Loop duration (s):</Text>
                            <input
                                type="number"
                                min={1}
                                max={60}
                                step={1}
                                defaultValue={duration}
                                style={{ width: '4rem' }}
                                onChange={(e) => {
                                    setDuration(parseDurationInput(e.currentTarget.value));
                                }}
                            />
                        </Stack>
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
                {shaderError ? (
                    <ControlField label="Shader Error">
                        <Stack gap="1">
                            <Text>
                                [{shaderError.stage}] {shaderError.message}
                            </Text>
                        </Stack>
                    </ControlField>
                ) : (
                    <ControlField label="Shader Status">
                        <Text variant="muted">
                            {compiledShader.animated
                                ? 'Animated shader active'
                                : 'Static shader active'}
                        </Text>
                    </ControlField>
                )}
            </Stack>
        </ControlSection>
    );
}
