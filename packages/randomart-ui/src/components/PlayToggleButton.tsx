import { Button } from '@repo/ui/components/Button';

import { useCanAnimate, useClockStore, useIsPlaying } from '../stores/vmStore';

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
