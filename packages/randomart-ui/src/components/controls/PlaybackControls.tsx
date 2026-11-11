import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { useIsAnimated } from '../../stores/artworkStore';
import { useClockStore, useIsPlaying } from '../../stores/surfaceStore';

/** Toy-level animation actions: play/pause the clock and reset it to the start. */
export function PlaybackControls() {
    const isAnimated = useIsAnimated();
    const clockStore = useClockStore();
    const isPlaying = useIsPlaying();
    const canAnimate = clockStore !== null && isAnimated;

    return (
        <Grid columns="2" gap="2">
            <Button
                title="play/pause the animation"
                color="aurora"
                onClick={() => {
                    clockStore?.togglePlay();
                }}
                disabled={!canAnimate}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
                title="reset the animation clock"
                onClick={() => {
                    clockStore?.reset();
                }}
                disabled={!canAnimate}
            >
                Reset
            </Button>
        </Grid>
    );
}
