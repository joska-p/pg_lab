import { Grid } from '@repo/ui/components/Grid';

import { ArtworkActions } from './ArtworkActions';
import { PlaybackControls } from './PlaybackControls';

/** Toy-level controls: the actions a visitor reaches for first. */
export function PrimaryActions() {
    return (
        <Grid columns="1" gap="2">
            <PlaybackControls />
            <ArtworkActions />
        </Grid>
    );
}
