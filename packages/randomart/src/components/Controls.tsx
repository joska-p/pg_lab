import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import {
    regenerate,
    useClockStore,
    useCompiledShader,
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

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    return (
        <ControlSection title="randomart">
            <Stack gap="3">
                <ControlField label="Artwork">
                    <Stack gap="2">
                        <Button
                            onClick={() => {
                                regenerate();
                            }}
                        >
                            Regenerate
                        </Button>
                        <Text variant="muted">
                            Seed: {seed} • {compiledShader.stats.nodes} nodes
                        </Text>
                    </Stack>
                </ControlField>

                <ControlField label="Playback">
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
                </ControlField>

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
