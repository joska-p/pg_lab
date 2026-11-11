import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { useState } from 'react';

import { exportPng } from '../../commands/exportPng';
import { createPhase } from '../../renderer/renderGate';
import { newSeed, useCompiledShader, useSeed } from '../../stores/artworkStore';
import { reportError } from '../../stores/errorStore';
import { useClockStore } from '../../stores/surfaceStore';

/** Toy-level generation/output actions: draw a new seed and export the current artwork. */
export function ArtworkActions() {
    const seed = useSeed();
    const compiledShader = useCompiledShader();
    const clockStore = useClockStore();
    const [exporting, setExporting] = useState(false);

    return (
        <Grid columns="2" gap="2">
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
    );
}
