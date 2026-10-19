import { Grid } from '@repo/ui/components/Grid';

import { ArtworkSection } from './ArtworkSection';
import { GrammarSection } from './GrammarSection';
import { Inspector } from './Inspector';
import { SessionSection } from './SessionSection';

/**
 * The unified lab (workshop) panel: orchestrates generation, recipe presets, tree constraints,
 * vocabulary weights, playback loops, artwork I/O, and expression inspection.
 */
export function LabPanel() {
    return (
        <Grid columns="1" gap="8">
            <SessionSection />
            <GrammarSection />
            <ArtworkSection />
            <Inspector />
        </Grid>
    );
}
