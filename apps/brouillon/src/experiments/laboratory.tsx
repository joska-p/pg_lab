import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../stores/appStore';
import type { Theme } from '../stores/appStore';
import { Button } from './ui/components/Button';
import { Card } from './ui/components/Card';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
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
    stackH: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: space['5'],
    },

    stackV: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['5'],
    },

    select: {
        width: 'fit-content',
        marginBlock: space['4'],
        marginInline: 'auto',
    },
});

function ElevationStack({ color }: { color: ColorNames }) {
    return (
        <div {...stylex.props(labStyles.stackV)}>
            {elevationList.map((elevation) => {
                return (
                    <Card elevation={elevation} color={color} key={elevation}>
                        {elevation}
                        <Button color={color}>{color.toString()}</Button>
                    </Card>
                );
            })}
        </div>
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
            <ExperimentShell panel={<ControlPanel label="testing">Hello world.</ControlPanel>}>
                <Stage>
                    <select {...stylex.props(labStyles.select)} onChange={handleChange}>
                        <option value="dark">dark</option>
                        <option value={'light'}>light</option>
                    </select>

                    <div {...stylex.props(labStyles.stackH)}>
                        {colorList.map((color, index) => (
                            <ElevationStack key={index} color={color} />
                        ))}
                    </div>
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}
