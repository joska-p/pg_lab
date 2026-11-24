import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { useState } from 'react';

import { exportPng } from '../../commands/exportPng';
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
                    const time = compiledShader.animated ? (clockStore?.time ?? 0) : 0;
                    setExporting(true);
                    void exportPng({
                        fragmentShader: compiledShader.source,
                        time,
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
