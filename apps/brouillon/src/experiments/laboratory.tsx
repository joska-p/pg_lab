import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../stores/appStore';
import type { Theme } from '../stores/appStore';
import { Button } from './Button';
import { Card } from './Card';
import { space } from './const.stylex';
import { colors } from './styles.stylex';
import type { ColorNames } from './styles.stylex';

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
    root: {
        display: 'grid',
        minHeight: '100dvh',
        placeContent: 'center',
        padding: space['4'],
        backgroundImage: `
      radial-gradient(45% 35% at 4% 6%, color-mix(in oklab, ${colors.error} 30%, transparent), transparent 70%),
      radial-gradient(40% 35% at 96% 8%, color-mix(in oklab, ${colors.orange} 28%, transparent), transparent 70%),
      radial-gradient(50% 40% at 88% 88%, color-mix(in oklab, ${colors.amber} 26%, transparent), transparent 70%),
      radial-gradient(45% 45% at 8% 92%, color-mix(in oklab, ${colors.solder} 28%, transparent), transparent 70%),
      radial-gradient(55% 40% at 50% 0%, color-mix(in oklab, ${colors.aqua} 24%, transparent), transparent 70%),
      radial-gradient(50% 50% at 100% 55%, color-mix(in oklab, ${colors.aurora} 30%, transparent), transparent 70%),
      radial-gradient(45% 40% at 0% 50%, color-mix(in oklab, ${colors.purple} 28%, transparent), transparent 70%),
      radial-gradient(35% 30% at 50% 55%, color-mix(in oklab, ${colors.neutral} 20%, transparent), transparent 70%),
      linear-gradient(160deg, color-mix(in oklab, ${colors.neutral} 20%, transparent), transparent 65%)
    `,
    },

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
        <div {...stylex.props(labStyles.root)}>
            <select {...stylex.props(labStyles.select)} onChange={handleChange}>
                <option value="dark">dark</option>
                <option value={'light'}>light</option>
            </select>

            <div {...stylex.props(labStyles.stackH)}>
                {colorList.map((color, index) => (
                    <ElevationStack key={index} color={color} />
                ))}
            </div>
        </div>
    );
}
