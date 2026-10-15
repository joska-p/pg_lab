import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stack } from '@repo/ui/components/Stack';
import { Stage } from '@repo/ui/components/Stage';

import { Controls } from './components/Controls';
import { Inspector } from './components/Inspector';
import { Scene } from './components/Scene';

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <Stack gap="6">
                            <Controls />
                            <Inspector />
                        </Stack>
                    }
                >
                    <Stage label="randomart">
                        <Scene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
