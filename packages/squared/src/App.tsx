import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    stageLabel="smith-tutte"
                    panel={
                        <ControlPanel action={<ThemeToggle />}>
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
