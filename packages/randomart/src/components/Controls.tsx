import { BenchPanel } from '@repo/randomart-bench/ui/BenchPanel';
import { HistoryPanel } from '@repo/randomart-lab/components/history/HistoryPanel';
import { LabPanel } from '@repo/randomart-lab/components/lab/LabPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import { setMode, useMode } from '../stores/modeStore';
import type { AppMode } from '../stores/modeStore';

export type { AppMode } from '../stores/modeStore';

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
 * The mode lives in the app store so `Scene` can switch between the live canvas and the bench
 * planche even when the playground mounts the two modules separately. The panel-level error
 * boundary is kept around all modes, so a failure in any of them leaves the stage intact.
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
