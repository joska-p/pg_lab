import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';

import { VmPanel } from './components/VmPanel';
import { VmScene } from './components/VmScene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell panel={<VmPanel />}>
                    <Stage label="randomart-vm">
                        <VmScene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
