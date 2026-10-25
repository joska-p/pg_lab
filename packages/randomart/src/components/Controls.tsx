import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { Stack } from '@repo/ui/components/Stack';
import { Activity } from 'react';

import { setMode, useMode } from '../stores/modeStore';
import type { AppMode } from '../stores/modeStore';
import { LabPanel } from './lab/LabPanel';
import { ToyPanel } from './toy/ToyPanel';

const MODE_OPTIONS = [
    { value: 'toy', label: 'Toy' },
    { value: 'lab', label: 'Lab' },
] as const satisfies readonly { value: AppMode; label: string }[];

export function Controls() {
    const mode = useMode();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <Segmented<AppMode> value={mode} options={MODE_OPTIONS} onValueChange={setMode} />

                <Activity mode={mode === 'toy' ? 'visible' : 'hidden'}>
                    <ToyPanel />
                </Activity>
                <Activity mode={mode === 'lab' ? 'visible' : 'hidden'}>
                    <LabPanel />
                </Activity>
            </Stack>
        </ErrorBoundary>
    );
}
