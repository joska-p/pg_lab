import { Button } from '@repo/ui/components/Button';

import { useCanAnimate, useClockStore, useIsPlaying } from '../stores/labStore';

/**
 * The single play/pause control, shared by Toy and Lab. Playback belongs to the clock store, so
 * switching faces keeps the animation running.
 */
export function PlayToggleButton() {
    const clockStore = useClockStore();
    const isPlaying = useIsPlaying();
    const canAnimate = useCanAnimate();

    return (
        <Button
            title="play/pause the animation"
            color="aurora"
            onClick={() => {
                clockStore.togglePlay();
            }}
            disabled={!canAnimate}
        >
            {isPlaying ? 'Pause' : 'Play'}
        </Button>
    );
}
