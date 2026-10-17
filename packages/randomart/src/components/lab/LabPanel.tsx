import { Stack } from '@repo/ui/components/Stack';

import { Inspector } from '../Inspector';
import { ArtworkSection } from './ArtworkSection';
import { GrammarSection } from './GrammarSection';
import { PlaybackSection } from './PlaybackSection';
import { SessionSection } from './SessionSection';
import { VocabularySection } from './VocabularySection';

/**
 * The unified lab (workshop) panel: orchestrates generation, recipe presets, tree constraints,
 * vocabulary weights, playback loops, artwork I/O, and expression inspection.
 */
export function LabPanel() {
    return (
        <Stack gap="8">
            <SessionSection />
            <PlaybackSection />
            <GrammarSection />
            <VocabularySection />
            <ArtworkSection />
            <Inspector />
        </Stack>
    );
}
