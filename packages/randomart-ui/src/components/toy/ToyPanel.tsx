import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { useState } from 'react';

import { exportPng } from '../../commands/exportPng';
import { createPhase } from '../../renderer/renderGate';
import { newSeed, useCompiledShader, useIsAnimated, useSeed } from '../../stores/artworkStore';
import { reportError } from '../../stores/errorStore';
import { useClockStore, useIsPlaying } from '../../stores/surfaceStore';
import { GrammarSelect } from './GrammarSelect';

export function ToyPanel() {
    const seed = useSeed();
    const isAnimated = useIsAnimated();
    const compiledShader = useCompiledShader();
    const clockStore = useClockStore();
    const isPlaying = useIsPlaying();
    const canAnimate = clockStore !== null && isAnimated;
    const [exporting, setExporting] = useState(false);

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
                    disabled={exporting}
                    onClick={() => {
                        const progress = clockStore?.progress ?? 0;
                        const phase = compiledShader.animated ? createPhase(progress) : 0;
                        setExporting(true);
                        void exportPng({
                            fragmentShader: compiledShader.source,
                            phase,
                            seed,
                        })
                            .catch(reportError)
                            .finally(() => {
                                setExporting(false);
                            });
                    }}
                >
                    Export PNG
                </Button>
            </Grid>

            <GrammarSelect />
        </Grid>
    );
}
