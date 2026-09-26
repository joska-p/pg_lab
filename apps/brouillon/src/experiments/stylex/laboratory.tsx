import * as stylex from '@stylexjs/stylex';

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
import type { Background, ColorNames, Elevation, SurfaceTint } from './ui/styles.stylex';

/* -------------------------------------------------------------------------- */
/* Laboratory                                                                 */
/* -------------------------------------------------------------------------- */

const elevations = ['sunken', 'flat', 'raised'] as Elevation[];
const colors = [
    'neutral',
    'aurora',
    'solder',
    'purple',
    'amber',
    'error',
    'aqua',
    'orange',
] as ColorNames[];
const bgs = ['solid', 'soft'] as Background[];
const tints = ['tinted', 'accent'] as SurfaceTint[];

const labStyles = stylex.create({
    // Scope de thème : color-scheme local pilote light-dark()
    // pour tout le lab, sans toucher à documentElement.
    light: {
        colorScheme: 'light',
    },
    dark: {
        colorScheme: 'dark',
    },
    system: {
        colorScheme: 'light dark',
    },
    select: {
        width: 'fit-content',
        marginBlock: space['4'],
        marginInline: 'auto',
    },
    section: {
        marginBlock: space['4'],
    },
});

export function Tints({
    color,
    elevation,
    bg,
}: {
    color: ColorNames;
    elevation: Elevation;
    bg: Background;
}) {
    return (
        <>
            {tints.map((tint, index) => {
                return (
                    <Card key={index} bg={bg} color={color} elevation={elevation} tint={tint}>
                        <ul>
                            <li> Elevation: {elevation}</li>
                            <li>Color: {color}</li>
                            <li>Tint: {tint}</li>
                            <li>Background: {bg}</li>
                        </ul>
                        <Button bg="solid" color={color} elevation={elevation} tint="accented">
                            solid, accented
                        </Button>
                        <Button bg="solid" color={color} elevation={elevation} tint="tinted">
                            solid, tinted
                        </Button>
                        <Button bg="soft" color={color} elevation={elevation} tint="accented">
                            soft, accented
                        </Button>
                        <Button bg="soft" color={color} elevation={elevation} tint="tinted">
                            soft, tinted
                        </Button>
                    </Card>
                );
            })}
        </>
    );
}

export function Backgrounds({ color, elevation }: { color: ColorNames; elevation: Elevation }) {
    return (
        <>
            {bgs.map((bg, index) => (
                <Tints key={index} bg={bg} color={color} elevation={elevation} />
            ))}
        </>
    );
}

export function Elevations({ color }: { color: ColorNames }) {
    return (
        <Stack direction="vertical" gap="4">
            {elevations.map((elevation, index) => (
                <Backgrounds key={index} elevation={elevation} color={color} />
            ))}
        </Stack>
    );
}

export function Colors() {
    return (
        <Stack direction="horizontal" gap="4" justify="between">
            {colors.map((color, index) => (
                <Elevations key={index} color={color} />
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

    return (
        <div {...stylex.props(labStyles[theme])}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={<ControlPanel label="testing">Hello world.</ControlPanel>}
                >
                    <Stage>
                        <select
                            {...stylex.props(labStyles.select)}
                            onChange={handleChange}
                            value={theme}
                        >
                            <option value="dark">dark</option>
                            <option value={'light'}>light</option>
                        </select>

                        <Colors />
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </div>
    );
}
