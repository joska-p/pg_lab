import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';
import { useEffect } from 'react';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { useTheme } from './stores/appStore';

export function App() {
    const theme = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel action={<ThemeToggle />}>
                            <Controls />
                        </ControlPanel>
                    }
                >
                    <Stage label="smith-tutte">
                        <Scene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
