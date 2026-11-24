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
                    stageLabel="art-canvas"
                    panel={
                        <ControlPanel title="art-canvas">
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
