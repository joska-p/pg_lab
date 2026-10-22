import { Grid } from '@repo/ui/components/Grid';

import { ErrorReadout } from '../ErrorReadout';
import { ArtworkSection } from './ArtworkSection';
import { GrammarSection } from './GrammarSection';
import { Inspector } from './Inspector';
import { PlaybackSection } from './PlaybackSection';

/**
 * The lab (workshop) panel: playback, grammar presets and weights, artwork I/O, and expression
 * inspection. History stays in Toy; Lab edits one artwork at a time.
 */
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
