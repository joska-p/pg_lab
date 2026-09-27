import * as stylex from '@stylexjs/stylex';

import { useTheme, setTheme } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stack } from './ui/components/Stack';
import { Stage } from './ui/components/Stage';
import { space } from './ui/const.stylex';
import { CardMatrix } from './ui/demos/card.demo';
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

    function handleTheme(event: React.ChangeEvent<HTMLSelectElement>) {
        setTheme(event.currentTarget.value as Theme);
    }

    return (
        <div {...stylex.props(labStyles[theme])}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={
                        <ControlPanel label="laboratory controls">
                            <h2 {...stylex.props(heading.level2)}>Theme</h2>
                            <select
                                {...stylex.props(labStyles.select)}
                                onChange={handleTheme}
                                value={theme}
                            >
                                <option value="dark">dark</option>
                                <option value="light">light</option>
                                <option value="system">system</option>
                            </select>
                        </ControlPanel>
                    }
                >
                    <Stage>
                        <Stack direction="vertical" gap="8">
                            <CardMatrix />
                        </Stack>
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </div>
    );
}
