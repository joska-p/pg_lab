import { ControlPanel } from '@repo/ui-next/components/ControlPanel';
import { ExperimentShell } from '@repo/ui-next/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui-next/components/ShellWrapper';
import { Stage } from '@repo/ui-next/components/Stage';
import { useTheme, type Theme } from '@repo/ui-next/hooks/useTheme';
import { useId } from 'react';

import { useComponentName, setComponentName } from '../../stores/appStore';
import { DemoCanvas } from './demos/DemoCanvas';
import { components, type ComponentName } from './demos/registry';
import { VariantFilterSection } from './demos/VariantFilterSection';

export const registryOptions = Object.keys(components) as ComponentName[];

export function Laboratory() {
    const registryKey = useComponentName();
    const themeId = useId();
    const componentId = useId();
    const [theme, setTheme] = useTheme();

    function handleComponent(event: React.ChangeEvent<HTMLSelectElement>) {
        setComponentName(event.currentTarget.value as ComponentName);
    }

    return (
        <div>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={
                        <ControlPanel label="Laboratory controls">
                            <label htmlFor={themeId}>Theme</label>

                            <select
                                id={themeId}
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as Theme)}
                            >
                                <option value="system">System</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>

                            <VariantFilterSection target="card" title="Card filter" />

                            <label htmlFor={componentId}>Component</label>

                            <select
                                id={componentId}

                                onChange={handleComponent}
                                value={registryKey}
                            >
                                {registryOptions.map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>

                            <VariantFilterSection
                                target="component"
                                title={`Component filter (${registryKey})`}
                            />
                        </ControlPanel>
                    }
                >
                    <Stage>
                        <DemoCanvas />
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </div>
    );
}
