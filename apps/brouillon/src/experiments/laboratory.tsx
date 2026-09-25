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
    shadows,
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
    elevation?: keyof typeof shadows;
    family?: FamilyName;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

function Card({ elevation = 'flat', family = 'neutral', style, children }: CardProps) {
    const compoundStyle = stylex.props(
        cardStyles.base(family),
        borders.subtle,
        borders.rounded,
        shadows[elevation],
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

const labStyles = stylex.create({
    root: {
        display: 'grid',
        placeContent: 'center',
        padding: space['4'],
    },

    stack: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: space['4'],
    },

    select: {
        width: 'fit-content',
        marginBlock: space['4'],
        marginInline: 'auto',
    },
});

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
            <div {...stylex.props(labStyles.stack)}>
                <Card family="neutral" elevation="flat">
                    <strong>neutral</strong>

                    <Button>default</Button>
                </Card>

                <Card family="aurora" elevation="raised">
                    <strong>aurora</strong>

                    <Button family="aurora">aurora</Button>
                </Card>

                <Card family="solder" elevation="sunken">
                    <strong>solder</strong>

                    <Button family="solder">solder</Button>
                </Card>

                <Card family="amber" elevation="raised">
                    <strong>amber</strong>

                    <Button family="amber">amber</Button>
                </Card>

                <Card family="error" elevation="raised">
                    <strong>error</strong>

                    <Button family="error">error</Button>
                </Card>

                <Card family="aqua" elevation="raised">
                    <strong>aqua</strong>

                    <Button family="aqua">aqua</Button>
                </Card>

                <Card family="orange" elevation="raised">
                    <strong>orange</strong>

                    <Button family="orange">orange</Button>
                </Card>

                <Card family="neon-violet" elevation="raised">
                    <strong>neon violet</strong>

                    <div {...stylex.props(labStyles.stack)}>
                        <Button family="neon-violet">neon violet</Button>

                        <Button family="neon-violet" disabled>
                            disabled
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
