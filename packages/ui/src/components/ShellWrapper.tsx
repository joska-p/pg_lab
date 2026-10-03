import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { palette } from '../tokens/const.stylex';
import { surface } from '../tokens/surface.stylex';

export const backgrounds = stylex.create({
    'thermal-magma': {
        backgroundImage: `
            radial-gradient(
                70% 60% at 15% 15%,
                color-mix(in oklab, light-dark(${palette.neutralRed}, ${palette.brightRed}) 50%, transparent),
                transparent 80%
            ),
            radial-gradient(
                65% 65% at 85% 20%,
                color-mix(in oklab, light-dark(${palette.neutralOrange}, ${palette.brightOrange}) 45%, transparent),
                transparent 80%
            ),
            radial-gradient(
                75% 70% at 80% 80%,
                color-mix(in oklab, light-dark(${palette.neutralPurple}, ${palette.brightPurple}) 40%, transparent),
                transparent 80%
            ),
            radial-gradient(
                60% 60% at 20% 85%,
                color-mix(in oklab, light-dark(${palette.neutralBlue}, ${palette.brightBlue}) 40%, transparent),
                transparent 80%
            ),
            radial-gradient(
                50% 50% at 50% 50%,
                color-mix(in oklab, light-dark(${palette.neutralYellow}, ${palette.brightYellow}) 35%, transparent),
                transparent 75%
            )
        `,
    },

    'auroral-fluid': {
        backgroundImage: `
            radial-gradient(
                80% 50% at 50% 0%,
                color-mix(in oklab, light-dark(${palette.fadedAqua}, ${palette.brightAqua}) 65%, transparent),
                transparent 75%
            ),
            radial-gradient(
                60% 70% at 0% 50%,
                color-mix(in oklab, light-dark(${palette.fadedPurple}, ${palette.brightPurple}) 60%, transparent),
                transparent 75%
            ),
            radial-gradient(
                60% 70% at 100% 50%,
                color-mix(in oklab, light-dark(${palette.fadedYellow}, ${palette.brightYellow}) 60%, transparent),
                transparent 75%
            ),
            radial-gradient(
                70% 60% at 30% 100%,
                color-mix(in oklab, light-dark(${palette.fadedGreen}, ${palette.brightGreen}) 55%, transparent),
                transparent 80%
            ),
            radial-gradient(
                70% 60% at 70% 100%,
                color-mix(in oklab, light-dark(${palette.fadedRed}, ${palette.brightRed}) 55%, transparent),
                transparent 80%
            )
        `,
    },

    'lava-flow': {
        backgroundImage: `
            radial-gradient(
                60% 60% at 30% 25%,
                color-mix(in oklab, light-dark(${palette.neutralOrange}, ${palette.brightOrange}) 55%, transparent),
                transparent 75%
            ),
            radial-gradient(
                70% 50% at 75% 30%,
                color-mix(in oklab, light-dark(${palette.neutralRed}, ${palette.brightRed}) 50%, transparent),
                transparent 80%
            ),
            radial-gradient(
                65% 65% at 50% 75%,
                color-mix(in oklab, light-dark(${palette.neutralYellow}, ${palette.brightYellow}) 45%, transparent),
                transparent 80%
            ),
            radial-gradient(
                55% 55% at 10% 80%,
                color-mix(in oklab, light-dark(${palette.neutralPurple}, ${palette.brightPurple}) 40%, transparent),
                transparent 75%
            ),
            radial-gradient(
                50% 50% at 90% 85%,
                color-mix(in oklab, light-dark(${palette.neutralBlue}, ${palette.brightBlue}) 35%, transparent),
                transparent 75%
            )
        `,
    },
});

export type ShellBackground = keyof typeof backgrounds;

const styles = stylex.create({
    base: {
        width: '100%',
        height: '100dvh',
        boxSizing: 'border-box',
        backgroundColor: surface.background,
        color: surface.foreground,
    },
});

interface ShellWrapperProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children?: React.ReactNode;
    background?: ShellBackground;
    style?: StyleXStyles;
}

export function ShellWrapper({
    children,
    background = 'auroral-fluid',
    style,
    ...props
}: ShellWrapperProps) {
    return (
        <div {...props} {...stylex.props(styles.base, backgrounds[background], style)}>
            {children}
        </div>
    );
}
