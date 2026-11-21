import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    stageLabel="Mosaic"
                    panel={
                        <ControlPanel title="Mosaic Maker">
                            <ErrorBoundary showStack={import.meta.env.DEV}>
                                <Controls />
                            </ErrorBoundary>
                        </ControlPanel>
                    }
                >
                    <ErrorBoundary showStack={import.meta.env.DEV}>
                        <Scene />
                    </ErrorBoundary>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
