import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';

import { setMode, useMode } from '../stores/modeStore';
import type { AppMode } from '../stores/types';
import { BenchPanel } from './bench/BenchPanel';
import { LabPanel } from './lab/LabPanel';
import { ToyPanel } from './toy/ToyPanel';

export type { AppMode } from '../stores/types';

const MODE_OPTIONS = [
    { value: 'toy', label: 'Toy' },
    { value: 'lab', label: 'Lab' },
    { value: 'bench', label: 'Bench' },
] as const satisfies readonly { value: AppMode; label: string }[];

/**
 * The panel orchestrator: one switch between the three faces of randomart.
 *
 * - **Toy** (play): three gestures — new image, play/pause, export — plus the history of what was
 *   seen.
 * - **Lab** (workshop): the unified creation and grammar workshop — playback, presets, weights and
 *   artwork files.
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
                {mode === 'toy' ? <ToyPanel /> : null}
                {mode === 'lab' ? <LabPanel /> : null}
                {mode === 'bench' ? <BenchPanel /> : null}
            </Stack>
        </ErrorBoundary>
    );
}
