import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useTheme } from '@repo/ui/hooks/useTheme';
import type { Theme } from '@repo/ui/hooks/useTheme';
import { useEffect } from 'react';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function App() {
    const [theme, setTheme] = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper background="auroral-fluid">
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="notebook atelier">
                            <Select
                                label="Theme"
                                value={theme}
                                onValueChange={(val) => setTheme(val as Theme)}
                                options={[
                                    { value: 'system', label: 'System' },
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' },
                                ]}
                            />
                            <Controls />
                        </ControlPanel>
                    }
                >
                    <Stage label="notebook">
                        <Scene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
