import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';
import { useState } from 'react';

import { LabPanel } from './lab/LabPanel';
import { PlayPanel } from './play/PlayPanel';

type Mode = 'play' | 'lab';

const MODE_OPTIONS = [
    { value: 'play', label: 'Play' },
    { value: 'lab', label: 'Lab' },
] as const satisfies readonly { value: Mode; label: string }[];

/**
 * The panel orchestrator: one switch between the two faces of randomart.
 *
 * - **Play** (toy): the immediate gesture — generate, shuffle, pick a recipe, keep the image.
 * - **Lab** (tool): the grammar workshop — vocabulary, weights, constraints, history and files.
 *
 * The mode is view state, not app state (conventions §3): it lives here, not in the store, and is
 * lost on reload. The panel-level error boundary is kept around both modes, so a failure in either
 * leaves the stage intact.
 */
export function Controls() {
    const [mode, setMode] = useState<Mode>('play');

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <Segmented<Mode>
                    label="Mode"
                    value={mode}
                    options={MODE_OPTIONS}
                    onValueChange={setMode}
                />
                {mode === 'play' ? <PlayPanel /> : <LabPanel />}
            </Stack>
        </ErrorBoundary>
    );
}
