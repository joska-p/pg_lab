import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { useTheme, setTheme, useComponentName, setComponentName } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import { DemoCanvas } from './demos/DemoCanvas';
import type { ComponentName } from './demos/registry';
import { components } from './demos/registry';
import { VariantFilterSection } from './demos/VariantFilterSection';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stage } from './ui/components/Stage';
import { layout, space } from './ui/const.stylex';
import { interactionStyles } from './ui/interactions';
import { surfaceStyles } from './ui/surface';
import { surface } from './ui/surface.stylex';
import { heading } from './ui/typography';

const labStyles = stylex.create({
    light: { colorScheme: 'light' },
    dark: { colorScheme: 'dark' },
    system: { colorScheme: 'light dark' },
    select: {
        marginBlock: space['4'],
        width: '100%',
        minHeight: layout.controlFieldMinHeight,
        paddingBlock: space['2'],
        paddingInline: space['2'],
        color: surface.foreground,
        cursor: 'pointer',
    },
    section: { marginBlock: space['4'] },
});

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
        <div {...stylex.props(labStyles[theme])}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={
                        <ControlPanel label="Laboratory controls">
                            <label htmlFor={themeId} {...stylex.props(heading.level2)}>
                                Theme
                            </label>

                            <select
                                id={themeId}
                                {...stylex.props(
                                    labStyles.select,
                                    surfaceStyles({
                                        color: 'neutral',
                                        background: 'soft',
                                        border: 'subtle',
                                        elevation: 'flat',
                                    }),
                                    interactionStyles(),
                                )}
                                onChange={handleTheme}
                                value={theme}
                            >
                                <option value="dark">dark</option>
                                <option value="light">light</option>
                                <option value="system">system</option>
                            </select>

                            <VariantFilterSection target="card" title="Card filter" />

                            <label htmlFor={componentId} {...stylex.props(heading.level2)}>
                                Component
                            </label>

                            <select
                                id={componentId}
                                {...stylex.props(
                                    labStyles.select,
                                    surfaceStyles({
                                        color: 'neutral',
                                        background: 'soft',
                                        border: 'subtle',
                                        elevation: 'flat',
                                    }),
                                    interactionStyles(),
                                )}
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
