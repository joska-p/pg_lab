import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { useEffect } from 'react';

import { GetStarted } from './components/GetStarted';
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
                    stageLabel="three-stage"
                    panel={
                        <ControlPanel title="three-stage controls">
                            <ControlSection title="Theme">
                                <Segmented<'light' | 'dark' | 'system'>
                                    options={['light', 'dark', 'system']}
                                    value={theme}
                                    onValueChange={setTheme}
                                />
                            </ControlSection>
                        </ControlPanel>
                    }
                >
                    <GetStarted />
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
