import { usePlayback } from '@repo/surface/react/usePlayback';
import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { useIsAnimated } from '../../stores/artworkStore';

/** Toy-level animation actions: play/pause the clock and reset it to the start. */
export function PlaybackControls() {
    const isAnimated = useIsAnimated();
    const { isPlaying, togglePlay, reset } = usePlayback();

    return (
        <Grid columns="2" gap="2">
            <Button
                title="play/pause the animation"
                color="aurora"
                onClick={togglePlay}
                disabled={!isAnimated}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button title="reset the animation clock" onClick={reset} disabled={!isAnimated}>
                Reset
            </Button>
        </Grid>
    );
}
