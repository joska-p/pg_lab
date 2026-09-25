import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useEffect } from 'react';

import { useTheme, setTheme } from '../stores/appStore';
import type { Theme } from '../stores/appStore';
import {
    backgrounds,
    backgroundColor,
    borders,
    borderColor,
    disabled,
    families,
    elevations,
    shadowColor,
    space,
    surface,
    pressable,
} from './laboratory.stylex';
import type { FamilyName } from './laboratory.stylex';

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const cardStyles = stylex.create({
    base: (family: FamilyName) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
        backgroundColor: surface.bg,
        color: surface.fg,
        [borderColor.color]: families[family],
        [shadowColor.color]: families[family],
    }),
});

interface CardProps {
    elevation?: keyof typeof elevations;
    family?: FamilyName;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

function Card({ elevation = 'flat', family = 'neutral', style, children }: CardProps) {
    const compoundStyle = stylex.props(
        cardStyles.base(family),
        borders.subtle,
        borders.rounded,
        elevations[elevation],
        style,
    );

    return <div {...compoundStyle}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

const buttonStyles = stylex.create({
    base: (family: FamilyName) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['3'],
        color: surface.fg,
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        fontWeight: 500,
        borderRadius: '6px',
        [backgroundColor.color]: families[family],
        [borderColor.color]: families[family],
    }),

    hover: {
        ':hover': {
            backgroundColor: `color-mix(in oklab, ${backgroundColor.color} 42%, ${surface.bg})`,
        },
    },

    active: {
        ':active': {
            backgroundColor: `color-mix(in oklab, ${backgroundColor.color} 58%, ${surface.bg})`,
        },
    },
});

interface ButtonProps {
    family?: FamilyName;
    disabled?: boolean;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

function Button({
    family = 'neutral',
    disabled: isDisabled = false,
    style,
    children,
}: ButtonProps) {
    const compoundStyle = stylex.props(
        buttonStyles.base(family),

        backgrounds.solid,
        buttonStyles.hover,
        buttonStyles.active,

        pressable.base,
        pressable.press,
        borders.focus,

        isDisabled && disabled.base,
        style,
    );

    return (
        <button type="button" disabled={isDisabled} {...compoundStyle}>
            {children}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/* Laboratory                                                                 */
/* -------------------------------------------------------------------------- */

const elevationList = ['sunken', 'flat', 'raised'] as const;
const familyList = [
    'neutral',
    'aurora',
    'solder',
    'neon-violet',
    'amber',
    'error',
    'aqua',
    'orange',
] as FamilyName[];

const labStyles = stylex.create({
    root: {
        display: 'grid',
        minHeight: '100dvh',
        placeContent: 'center',
        padding: space['4'],
        backgroundImage: `
      radial-gradient(45% 35% at 4% 6%, color-mix(in oklab, ${families.error} 30%, transparent), transparent 70%),
      radial-gradient(40% 35% at 96% 8%, color-mix(in oklab, ${families.orange} 28%, transparent), transparent 70%),
      radial-gradient(50% 40% at 88% 88%, color-mix(in oklab, ${families.amber} 26%, transparent), transparent 70%),
      radial-gradient(45% 45% at 8% 92%, color-mix(in oklab, ${families.solder} 28%, transparent), transparent 70%),
      radial-gradient(55% 40% at 50% 0%, color-mix(in oklab, ${families.aqua} 24%, transparent), transparent 70%),
      radial-gradient(50% 50% at 100% 55%, color-mix(in oklab, ${families.aurora} 30%, transparent), transparent 70%),
      radial-gradient(45% 40% at 0% 50%, color-mix(in oklab, ${families['neon-violet']} 28%, transparent), transparent 70%),
      radial-gradient(35% 30% at 50% 55%, color-mix(in oklab, ${families.neutral} 20%, transparent), transparent 70%),
      linear-gradient(160deg, color-mix(in oklab, ${families.neutral} 20%, transparent), transparent 65%)
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

function ElevationStack({ family }: { family: FamilyName }) {
    return (
        <div {...stylex.props(labStyles.stackV)}>
            {elevationList.map((elevation) => {
                return (
                    <Card elevation={elevation} family={family} key={elevation}>
                        {elevation}
                        <Button family={family}>{family.toString()}</Button>
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
                {familyList.map((family, index) => (
                    <ElevationStack key={index} family={family} />
                ))}
            </div>
        </div>
    );
}
