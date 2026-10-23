import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { exportPng, generateImage, useCanvas } from '../../stores/lab/labStore';
import { ErrorReadout } from '../ErrorReadout';
import { PlayToggleButton } from '../PlayToggleButton';
import { HistorySection } from './HistorySection';

/**
 * The toy face: play with what randomart produces, nothing to configure. Three gestures (new image,
 * play/pause, export) plus the history of what was seen. The grammar workshop lives in Lab.
 */
export function ToyPanel() {
    const canvas = useCanvas();

    return (
        <Grid columns="1" gap="3">
            <Button
                title="generate a new image"
                color="aqua"
                onClick={() => {
                    generateImage();
                }}
            >
                New image
            </Button>

            <Grid columns="2" gap="2">
                <PlayToggleButton />
                <Button
                    title="export the current image as PNG"
                    color="purple"
                    onClick={() => {
                        void exportPng();
                    }}
                    disabled={!canvas}
                >
                    Export image
                </Button>
            </Grid>

            <HistorySection />
            <ErrorReadout />
        </Grid>
    );
}
