import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';

import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <AppErrorBoundary>
                <ExperimentShell
                    panel={
                        <AppErrorBoundary>
                            <Controls />
                        </AppErrorBoundary>
                    }
                >
                    <Stage label="randomart">
                        <AppErrorBoundary>
                            <Scene />
                        </AppErrorBoundary>
                    </Stage>
                </ExperimentShell>
            </AppErrorBoundary>
        </ShellWrapper>
    );
}
