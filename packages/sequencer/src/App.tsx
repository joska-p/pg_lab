import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell stageLabel="sequencer" panel={<Controls />}>
                    <Scene />
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
