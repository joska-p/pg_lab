import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { NumberField } from '@repo/ui/components/NumberField';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import { MAX_LOOP_MS, MIN_LOOP_MS } from '../../core/artwork/index.ts';
import {
    parseDurationInput,
    setDuration,
    useActionError,
    useClockStore,
    useCompiledShader,
    useDuration,
    useHasClockStore,
    useShaderError,
} from '../../stores/appStore';

/**
 * Playback & Render status: controls time-dependent animation loops and displays shader compilation
 * errors or action faults.
 */
export function PlaybackSection() {
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const actionError = useActionError();
    const shaderError = useShaderError();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    const canAnimate = hasClockStore && compiledShader.animated;

    return (
        <Stack gap="3">
            <Stack gap="2">
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
                    <NumberField
                        label="Loop duration (s)"
                        min={MIN_LOOP_MS / 1000}
                        max={MAX_LOOP_MS / 1000}
                        step={0.5}
                        value={duration}
                        onValueChange={(val) => {
                            setDuration(parseDurationInput(String(val)));
                        }}
                    />
                </Stack>
            </Stack>

            {/* ── Faults & Status ── */}
            {actionError && (
                <ControlField label="Action Error">
                    <Text>{actionError}</Text>
                </ControlField>
            )}

            {shaderError && (
                <ControlField label="Shader Error">
                    <Text>
                        [{shaderError.stage}] {shaderError.message}
                    </Text>
                </ControlField>
            )}
        </Stack>
    );
}
