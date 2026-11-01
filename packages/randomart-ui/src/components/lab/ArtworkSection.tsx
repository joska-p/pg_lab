import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { exportPng, useCanvas } from '../../stores/vmStore';

export function ArtworkSection() {
    const canvas = useCanvas();

    return (
        <Grid columns="1" gap="2">
            <Button
                color="purple"
                onClick={() => {
                    void exportPng();
                }}
                disabled={!canvas}
            >
                Export PNG
            </Button>
        </Grid>
    );
}
