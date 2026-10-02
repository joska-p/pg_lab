import { ControlPanel } from '@repo/ui-next/components/ControlPanel';
import { ExperimentShell } from '@repo/ui-next/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui-next/components/ShellWrapper';
import { Stage } from '@repo/ui-next/components/Stage';
import { useId } from 'react';

import { useTheme, setTheme, useComponentName, setComponentName } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import { DemoCanvas } from './demos/DemoCanvas';
import type { ComponentName } from './demos/registry';
import { components } from './demos/registry';
import { VariantFilterSection } from './demos/VariantFilterSection';

export const registryOptions = Object.keys(components) as ComponentName[];

export function Laboratory() {
    const theme = useTheme();
    const registryKey = useComponentName();
    const themeId = useId();
    const componentId = useId();

    function handleTheme(event: React.ChangeEvent<HTMLSelectElement>) {
        setTheme(event.currentTarget.value as Theme);
    }

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

                                onChange={handleTheme}
                                value={theme}
                            >
                                <option value="dark">dark</option>
                                <option value="light">light</option>
                                <option value="system">system</option>
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
