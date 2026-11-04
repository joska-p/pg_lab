import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { exportPng } from '../../commands/exportPng';
import { newSeed, useArtwork, useSeed } from '../../stores/artworkStore';
import { reportError } from '../../stores/errorStore';
import { useCanvas, useClockStore, useIsPlaying } from '../../stores/surfaceStore';
import { GrammarSelect } from './GrammarSelect';

export function ToyPanel() {
    const artwork = useArtwork();
    const seed = useSeed();
    const canvas = useCanvas();
    const clockStore = useClockStore();
    const isPlaying = useIsPlaying();
    const canAnimate = clockStore !== null && artwork.shader.animated;

    return (
        <Grid columns="1" gap="4">
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
                <Button
                    title="generate a new seed with the current grammar"
                    color="aqua"
                    onClick={() => {
                        newSeed();
                    }}
                >
                    New seed
                </Button>
                <Button
                    title="export the current artwork as PNG"
                    color="purple"
                    onClick={() => {
                        if (canvas === null) {
                            return;
                        }
                        void exportPng(canvas, seed).catch(reportError);
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
