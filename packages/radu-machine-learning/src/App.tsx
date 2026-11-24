import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    stageLabel="radu-machine-learning"
                    panel={
                        <ControlPanel title="radu-machine-learning controls">
                            <Controls />
                        </ControlPanel>
                    }
                >
                    <Scene />
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
