import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell panel={<Controls />}>
                    <Stage label="automa">
                        <Scene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
