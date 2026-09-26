import { setTheme, useTheme } from '../../stores/appStore';
import type { Theme } from '../../stores/appStore';
import type { ColorNames, SurfaceTint } from './surfaces';
import { Button } from './ui/components/Button';
import { Card } from './ui/components/Card';
import { ControlPanel } from './ui/components/ControlPanel';
import { ExperimentShell } from './ui/components/ExperimentShell';
import { ShellWrapper } from './ui/components/ShellWrapper';
import { Stack } from './ui/components/Stack';
import { Stage } from './ui/components/Stage';

import styles from './laboratory.module.css';

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
        setTheme(event.currentTarget.value as Theme);
    }

    return (
        /* data-theme + color-scheme pilotent light-dark() : pas de JS de couleurs. */
        <div className="lab" data-theme={theme}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement="docked"
                    panel={<ControlPanel label="testing">Hello world.</ControlPanel>}
                >
                    <Stage>
                        <select className={styles.select} onChange={handleChange} value={theme}>
                            <option value="dark">dark</option>
                            <option value="light">light</option>
                        </select>

                        <div className={styles.section}>
                            <h2 className="heading-2">Boutons sur fond neutre</h2>
                            <ButtonShowcase />
                        </div>

                        <div className={styles.section}>
                            <h2 className="heading-2">Cartes accented</h2>
                            <CardShowcase tint="accented" />
                        </div>

                        <div className={styles.section}>
                            <h2 className="heading-2">Cartes tinted</h2>
                            <CardShowcase tint="tinted" />
                        </div>
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </div>
    );
}
