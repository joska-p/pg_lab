import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import { setMode, useMode } from '../stores/appStore';
import type { Mode } from '../stores/appStore';
import { GalleryPanel } from './gallery/GalleryPanel';
import { HistoryPanel } from './history/HistoryPanel';
import { LabPanel } from './lab/LabPanel';

const MODE_OPTIONS = [
    { value: 'lab', label: 'Lab' },
    { value: 'history', label: 'History' },
    { value: 'gallery', label: 'Gallery' },
] as const satisfies readonly { value: Mode; label: string }[];

/**
 * The panel orchestrator: one switch between the two faces of randomart.
 *
 * - **Lab** (workshop): the unified creation and grammar workshop — presets, weights, constraints,
 *   vocabulary, playback, history and artwork files.
 * - **Gallery** (lots): draw candidate grammars and inspect contact sheets.
 *
 * The mode lives in the store so the shell (`ExperimentShell`/`App`) can make the Stage switch
 * between the live canvas and the gallery planche. The panel-level error boundary is kept around
 * all modes, so a failure in any of them leaves the stage intact.
 */
export function Controls() {
    const mode = useMode();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <Segmented<Mode> value={mode} options={MODE_OPTIONS} onValueChange={setMode} />
                {mode === 'lab' ? <LabPanel /> : null}
                {mode === 'history' ? <HistoryPanel /> : null}
                {mode === 'gallery' ? <GalleryPanel /> : null}
            </Stack>
        </ErrorBoundary>
    );
}
