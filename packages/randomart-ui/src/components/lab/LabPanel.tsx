import { Grid } from '@repo/ui/components/Grid';

import { GrammarSection } from './GrammarSection';
import { Inspector } from './Inspector';
import { PlaybackSection } from './PlaybackSection';
import { ShaderSource } from './ShaderSource';

export function LabPanel() {
    return (
        <Grid columns="1" gap="8">
            <GrammarSection />
            <PlaybackSection />
            <Inspector />
            <ShaderSource />
        </Grid>
    );
}
