import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import {
    exportPng,
    resetSeed,
    useCanAnimate,
    useCanvas,
    useClockStore,
    useIsPlaying,
} from '../../stores/vmStore';
import { GrammarSelect } from './GrammarSelect';

export function ToyPanel() {
    const canvas = useCanvas();
    const clockStore = useClockStore();
    const canAnimate = useCanAnimate();
    const isPlaying = useIsPlaying();

    return (
        <Grid columns="1" gap="4">
            <Grid columns="2" gap="2">
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
                <Button
                    title="reset the animation clock"
                    onClick={() => {
                        clockStore.reset();
                    }}
                    disabled={!canAnimate}
                >
                    Reset
                </Button>
                <Button
                    title="generate a new seed with the current grammar"
                    color="aqua"
                    onClick={() => {
                        resetSeed();
                    }}
                >
                    New seed
                </Button>
                <Button
                    title="export the current image as PNG"
                    color="purple"
                    onClick={() => {
                        void exportPng();
                    }}
                    disabled={!canvas}
                >
                    Export PNG
                </Button>
            </Grid>

            <GrammarSelect />
        </Grid>
    );
}
