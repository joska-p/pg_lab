import { Grid } from '@repo/ui/components/Grid';

import { ErrorReadout } from '../ErrorReadout';
import { ArtworkSection } from './ArtworkSection';
import { GrammarSection } from './GrammarSection';
import { Inspector } from './Inspector';
import { PlaybackSection } from './PlaybackSection';

export function LabPanel() {
    return (
        <Grid columns="1" gap="8">
            <PlaybackSection />
            <GrammarSection />
            <ArtworkSection />
            <Inspector />
            <ErrorReadout />
        </Grid>
    );
}
