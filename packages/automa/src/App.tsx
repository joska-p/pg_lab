import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useEffect } from 'react';

import { CellMesh } from './components/canvas/CellMesh';
import { ControlPanel } from './components/controls/ControlPanel';
import { useTheme } from './stores/appStore';

export function App() {
    const theme = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell panel={<ControlPanel />}>
                    <Stage label="automa">
                        <CellMesh />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
