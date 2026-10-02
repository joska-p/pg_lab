import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useTheme, type Theme } from '@repo/ui/hooks/useTheme';

export function App() {
    const [theme, setTheme] = useTheme();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={
                        <ControlPanel label="Laboratory controls">
                            <Select
                                label="Theme"
                                value={theme}
                                onValueChange={(value) => setTheme(value as Theme)}
                                options={[
                                    { value: 'system', label: 'System' },
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' },
                                ]}
                            />
                        </ControlPanel>
                    }
                >
                    <Stage>
                        <h1>hello world</h1>
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </ErrorBoundary>
    );
}
