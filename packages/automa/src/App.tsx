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
                    stageLabel="automa"
                    panel={
                        <ErrorBoundary showStack={import.meta.env.DEV}>
                            <Controls />
                        </ErrorBoundary>
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
