import { Button } from '@repo/ui/components/Button';
import { Slider } from '@repo/ui/components/Slider';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useSyncExternalStore } from 'react';

import { setAnimationSpeed } from '../../stores/randomart/actions';
import {
    useAnimationSpeed,
    useClockStore,
    useHasClockStore,
} from '../../stores/randomart/selectors';

const styles = stylex.create({
    row: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        alignItems: 'center',
        gap: space['2'],
    },
});

// Play/pause is owned by the surface's clock (not the store): subscribe to it
// here and toggle it, as `SpiraleControls` does in art-canvas.
function PlaybackControls() {
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const animationSpeed = useAnimationSpeed();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    return (
        <div {...stylex.props(styles.row)}>
            <Button
                color="aurora"
                disabled={!hasClockStore}
                onClick={() => {
                    clockStore.togglePlay();
                }}
            >
                {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Slider
                label="Speed"
                min={0}
                max={2}
                step={0.1}
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
            />
        </div>
    );
}

export { PlaybackControls };
