import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import { setMode, useMode } from '../stores/appStore.ts';
import type { AppMode } from '../stores/appStore.ts';
import { BenchPanel } from './bench/BenchPanel.tsx';
import { HistoryPanel } from './history/HistoryPanel.tsx';
import { LabPanel } from './lab/LabPanel.tsx';

const MODE_OPTIONS = [
    { value: 'lab', label: 'Lab' },
    { value: 'history', label: 'History' },
    { value: 'bench', label: 'Bench' },
] as const satisfies readonly { value: AppMode; label: string }[];

/**
 * The panel orchestrator: one switch between the three faces of randomart.
 *
 * - **Lab** (workshop): the unified creation and grammar workshop — presets, weights, playback and
 *   artwork files.
 * - **History** (timeline): walk back through past candidates.
 * - **Bench** (lots): draw candidate grammars and inspect contact sheets.
 *
 * The mode lives in the store so the shell (`ExperimentShell`/`App`) can make the Stage switch
 * between the live canvas and the bench planche. The panel-level error boundary is kept around all
 * modes, so a failure in any of them leaves the stage intact.
 */
export function Controls() {
    const mode = useMode();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <Segmented<AppMode> value={mode} options={MODE_OPTIONS} onValueChange={setMode} />
                {mode === 'lab' ? <LabPanel /> : null}
                {mode === 'history' ? <HistoryPanel /> : null}
                {mode === 'bench' ? <BenchPanel /> : null}
            </Stack>
        </ErrorBoundary>
    );
}
