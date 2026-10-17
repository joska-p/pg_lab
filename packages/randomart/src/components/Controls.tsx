import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import { setMode, useMode } from '../stores/appStore';
import type { Mode } from '../stores/appStore';
import { GalleryPanel } from './gallery/GalleryPanel';
import { LabPanel } from './lab/LabPanel';
import { PlayPanel } from './play/PlayPanel';

const MODE_OPTIONS = [
    { value: 'play', label: 'Play' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'lab', label: 'Lab' },
] as const satisfies readonly { value: Mode; label: string }[];

/**
 * The panel orchestrator: one switch between the three faces of randomart.
 *
 * - **Play** (toy): the immediate gesture — generate, shuffle, pick a recipe, keep the image.
 * - **Gallery** (lots): draw a lot of candidate grammars, look at the contact sheet, spot the dead
 *   ones (loop 2: exploring grammars instead of seeds).
 * - **Lab** (tool): the grammar workshop — vocabulary, weights, constraints, history and files.
 *
 * The mode now lives in the store so the shell (`ExperimentShell`/`App`) can make the Stage switch
 * between the live canvas and the gallery planche. The panel-level error boundary is kept around
 * all modes, so a failure in any of them leaves the stage intact.
 */
export function Controls() {
    const mode = useMode();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <Segmented<Mode>
                    label="Mode"
                    value={mode}
                    options={MODE_OPTIONS}
                    onValueChange={setMode}
                />
                {mode === 'play' ? <PlayPanel /> : null}
                {mode === 'gallery' ? <GalleryPanel /> : null}
                {mode === 'lab' ? <LabPanel /> : null}
            </Stack>
        </ErrorBoundary>
    );
}
