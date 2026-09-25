import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../stores/appStore';
import type { Theme } from '../stores/appStore';
import { Button } from './ui/components/Button';
import { Card } from './ui/components/Card';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stack } from './ui/components/Stack';
import { Stage } from './ui/components/Stage';
import { space } from './ui/const.stylex';
import type { ColorNames } from './ui/styles.stylex';

/* -------------------------------------------------------------------------- */
/* Laboratory                                                                 */
/* -------------------------------------------------------------------------- */

const elevationList = ['sunken', 'flat', 'raised'] as const;
const colorList = [
    'neutral',
    'aurora',
    'solder',
    'purple',
    'amber',
    'error',
    'aqua',
    'orange',
] as ColorNames[];

const labStyles = stylex.create({
    select: {
        width: 'fit-content',
        marginBlock: space['4'],
        marginInline: 'auto',
    },
});

function ElevationStack({ color }: { color: ColorNames }) {
    return (
        <Stack direction="vertical" gap="5">
            {elevationList.map((elevation) => {
                return (
                    <Card elevation={elevation} color={color} key={elevation}>
                        {elevation}
                        <Button color={color}>{color.toString()}</Button>
                    </Card>
                );
            })}
        </Stack>
    );
}

export function Laboratory() {
    const theme = useTheme();

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const theme = event.currentTarget.value as Theme;
        setTheme(theme);
    }

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'dark' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper>
            <ExperimentShell
                panelPlacement="docked"
                panel={<ControlPanel label="testing">Hello world.</ControlPanel>}
            >
                <Stage>
                    <select {...stylex.props(labStyles.select)} onChange={handleChange}>
                        <option value="dark">dark</option>
                        <option value={'light'}>light</option>
                    </select>

                    <Stack direction="horizontal" gap="5" justify="around">
                        {colorList.map((color, index) => (
                            <ElevationStack key={index} color={color} />
                        ))}
                    </Stack>
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}
