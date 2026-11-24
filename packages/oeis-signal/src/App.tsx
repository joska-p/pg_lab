import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { useEffect } from 'react';

import { NaturalsDemo } from './components/NaturalsDemo';
import { useTheme, setTheme } from './stores/appStore';

export function App() {
    const theme = useTheme();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    stageLabel="oes-signal"
                    panel={
                        <ControlPanel title="oes-signal controls">
                            <ControlSection title="Theme">
                                <Segmented<'light' | 'dark' | 'system'>
                                    options={['light', 'dark', 'system']}
                                    value={theme}
                                    onValueChange={setTheme}
                                />
                            </ControlSection>
                            <ControlSection title="Signal">
                                <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                                    Natural numbers visualization
                                </p>
                            </ControlSection>
                        </ControlPanel>
                    }
                >
                    <NaturalsDemo />
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
