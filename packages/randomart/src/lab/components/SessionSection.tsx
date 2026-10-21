import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { NumberField } from '@repo/ui/components/NumberField';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import { MAX_LOOP_MS, MIN_LOOP_MS } from '../../core/artwork/types';
import { exportPng } from '../stores/artworkStore';
import {
    parseDurationInput,
    generateImage,
    setDuration,
    useActionError,
    useClockStore,
    useCompiledShader,
    useDuration,
    useHasClockStore,
    useShaderError,
    useCanvas,
} from '../stores/labStore';

/** Image generation: generates a new artwork from the current grammar. */
export function SessionSection() {
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const actionError = useActionError();
    const shaderError = useShaderError();
    const canvas = useCanvas();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    const canAnimate = hasClockStore && compiledShader.animated;

    return (
        <Grid columns="1" gap="2">
            <Button
                title="generate a new image"
                color="aqua"
                onClick={() => {
                    generateImage();
                }}
            >
                New image
            </Button>

            <Button
                title="play/pause the animation"
                color="aurora"
                onClick={() => {
                    clockStore.togglePlay();
                }}
                disabled={!canAnimate}
            >
                {isPlaying ? 'pause' : 'play'}
            </Button>

            <Button
                color="purple"
                onClick={() => {
                    void exportPng();
                }}
                disabled={!canvas}
            >
                Export PNG
            </Button>

            <Stack gap="3" direction="horizontal" justify="between">
                <Button
                    onClick={() => {
                        clockStore.reset();
                    }}
                    disabled={!canAnimate}
                >
                    Reset
                </Button>

                <NumberField
                    direction="horizontal"
                    label="loop (s)"
                    min={MIN_LOOP_MS / 1000}
                    max={MAX_LOOP_MS / 1000}
                    step={0.5}
                    value={duration}
                    onValueChange={(val) => {
                        setDuration(parseDurationInput(String(val)));
                    }}
                />
            </Stack>

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
        </Grid>
    );
}
