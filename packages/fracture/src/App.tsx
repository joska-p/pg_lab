import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useEffect } from 'react';

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
                    panel={
                        <ControlPanel title="fracture controls">
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
                    <Stage label="fracture">
                        <h1>fracture</h1>
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
