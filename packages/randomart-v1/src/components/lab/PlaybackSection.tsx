import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { NumberField } from '@repo/ui/components/NumberField';
import { Stack } from '@repo/ui/components/Stack';

import { MAX_LOOP_DURATION, MIN_LOOP_DURATION } from '../../core/config/derived';
import {
    parseDurationInput,
    setDuration,
    useCanAnimate,
    useClockStore,
    useDuration,
} from '../../stores/labStore';
import { PlayToggleButton } from '../PlayToggleButton';

export function PlaybackSection() {
    const clockStore = useClockStore();
    const canAnimate = useCanAnimate();
    const duration = useDuration();

    return (
        <Grid columns="1" gap="3">
            <PlayToggleButton />

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
                    min={MIN_LOOP_DURATION}
                    max={MAX_LOOP_DURATION}
                    step={0.5}
                    value={duration}
                    onValueChange={(val) => {
                        setDuration(parseDurationInput(String(val)));
                    }}
                />
            </Stack>
        </Grid>
    );
}
