import * as stylex from '@stylexjs/stylex';

import { useTheme, setTheme, useRegistryKey, setRegistryKey } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import { DemoCanvas } from './demos/DemoCanvas';
import type { RegistryKey } from './demos/registry';
import { registryOptions } from './demos/registry';
import { VariantFilterSection } from './demos/VariantFilterSection';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stage } from './ui/components/Stage';
import { space } from './ui/const.stylex';
import { heading } from './ui/styles.stylex';

const labStyles = stylex.create({
    light: { colorScheme: 'light' },
    dark: { colorScheme: 'dark' },
    system: { colorScheme: 'light dark' },
    select: { marginBlock: space['4'] },
    section: { marginBlock: space['4'] },
});

export function Laboratory() {
    const theme = useTheme();
    const registryKey = useRegistryKey();

    function handleTheme(event: React.ChangeEvent<HTMLSelectElement>) {
        setTheme(event.currentTarget.value as Theme);
    }

    function handleComponent(event: React.ChangeEvent<HTMLSelectElement>) {
        setRegistryKey(event.currentTarget.value as RegistryKey);
    }

    return (
        <div {...stylex.props(labStyles[theme])}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={
                        <ControlPanel label="laboratory controls">
                            <h4 {...stylex.props(heading.level2)}>Theme</h4>
                            <select
                                {...stylex.props(labStyles.select)}
                                onChange={handleTheme}
                                value={theme}
                            >
                                <option value="dark">dark</option>
                                <option value="light">light</option>
                                <option value="system">system</option>
                            </select>
                            <VariantFilterSection target="card" title="Card (support)" />
                            <h4 {...stylex.props(heading.level2)}>Component</h4>
                            <select
                                {...stylex.props(labStyles.select)}
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
                                title={`Component (${registryKey})`}
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
