import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import { Button } from './ui/components/Button';
import { Card } from './ui/components/Card';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stack } from './ui/components/Stack';
import { Stage } from './ui/components/Stage';
import { space } from './ui/const.stylex';
import { heading } from './ui/styles.stylex';
import type { ColorNames, SurfaceTint } from './ui/styles.stylex';

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
    section: {
        marginBlock: space['4'],
    },
});

// Boutons : fond constant (carte neutre), seule la couleur du bouton varie.
// Chaque elevation de carte est testée, les boutons gardent leurs defaults
// (tinted → raised, accented → flat).
function ButtonShowcase() {
    return (
        <Stack direction="vertical" gap="5">
            {elevationList.map((elevation) => (
                <Card key={elevation} color="neutral" tint="accented" elevation={elevation}>
                    {elevation}
                    <Stack direction="horizontal" gap="3">
                        {colorList.map((color) => (
                            <Button key={color} color={color} tint="tinted">
                                {color.toString()}
                            </Button>
                        ))}
                    </Stack>
                    <Stack direction="horizontal" gap="3">
                        {colorList.map((color) => (
                            <Button key={`${color}-accented`} color={color} tint="accented">
                                {color.toString()}
                            </Button>
                        ))}
                    </Stack>
                </Card>
            ))}
        </Stack>
    );
}

// Cartes : contenu constant (bouton neutre), seule la carte varie.
function CardShowcase({ tint }: { tint: SurfaceTint }) {
    return (
        <Stack direction="horizontal" gap="5">
            {colorList.map((color) => (
                <Card key={color} color={color} tint={tint} elevation="flat">
                    {color}
                    <Button color="neutral" tint="accented">
                        action
                    </Button>
                </Card>
            ))}
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

                    <div {...stylex.props(labStyles.section)}>
                        <h2 {...stylex.props(heading.level2)}>Boutons sur fond neutre</h2>
                        <ButtonShowcase />
                    </div>

                    <div {...stylex.props(labStyles.section)}>
                        <h2 {...stylex.props(heading.level2)}>Cartes accented</h2>
                        <CardShowcase tint="accented" />
                    </div>

                    <div {...stylex.props(labStyles.section)}>
                        <h2 {...stylex.props(heading.level2)}>Cartes tinted</h2>
                        <CardShowcase tint="tinted" />
                    </div>
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}
