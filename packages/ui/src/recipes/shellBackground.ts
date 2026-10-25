import * as stylex from '@stylexjs/stylex';

import { palette } from '../tokens/const.stylex';

export const shellBackground = stylex.create({
    'thermal-magma': {
        backgroundImage: `
            radial-gradient(
                70% 60% at 15% 15%,
                color-mix(in oklab, light-dark(${palette.brightRed}, ${palette.fadedRed}) 50%, transparent),
                transparent 80%
            ),
            radial-gradient(
                65% 65% at 85% 20%,
                color-mix(in oklab, light-dark(${palette.brightOrange}, ${palette.fadedOrange}) 45%, transparent),
                transparent 80%
            ),
            radial-gradient(
                75% 70% at 80% 80%,
                color-mix(in oklab, light-dark(${palette.brightPurple}, ${palette.fadedPurple}) 40%, transparent),
                transparent 80%
            ),
            radial-gradient(
                60% 60% at 20% 85%,
                color-mix(in oklab, light-dark(${palette.brightBlue}, ${palette.fadedBlue}) 40%, transparent),
                transparent 80%
            ),
            radial-gradient(
                50% 50% at 50% 50%,
                color-mix(in oklab, light-dark(${palette.brightYellow}, ${palette.fadedYellow}) 35%, transparent),
                transparent 75%
            )
        `,
    },

    'auroral-fluid': {
        backgroundImage: `
            radial-gradient(
                80% 50% at 50% 0%,
                color-mix(in oklab, light-dark(${palette.brightAqua}, ${palette.fadedAqua}) 65%, transparent),
                transparent 75%
            ),
            radial-gradient(
                60% 70% at 0% 50%,
                color-mix(in oklab, light-dark(${palette.brightPurple}, ${palette.fadedPurple}) 60%, transparent),
                transparent 75%
            ),
            radial-gradient(
                60% 70% at 100% 50%,
                color-mix(in oklab, light-dark(${palette.brightYellow}, ${palette.fadedYellow}) 60%, transparent),
                transparent 75%
            ),
            radial-gradient(
                70% 60% at 30% 100%,
                color-mix(in oklab, light-dark(${palette.brightGreen}, ${palette.fadedGreen}) 55%, transparent),
                transparent 80%
            ),
            radial-gradient(
                70% 60% at 70% 100%,
                color-mix(in oklab, light-dark(${palette.brightRed}, ${palette.fadedRed}) 55%, transparent),
                transparent 80%
            )
        `,
    },

    'lava-flow': {
        backgroundImage: `
            radial-gradient(
                60% 60% at 30% 25%,
                color-mix(in oklab, light-dark(${palette.brightOrange}, ${palette.fadedOrange}) 55%, transparent),
                transparent 75%
            ),
            radial-gradient(
                70% 50% at 75% 30%,
                color-mix(in oklab, light-dark(${palette.brightRed}, ${palette.fadedRed}) 50%, transparent),
                transparent 80%
            ),
            radial-gradient(
                65% 65% at 50% 75%,
                color-mix(in oklab, light-dark(${palette.brightYellow}, ${palette.fadedYellow}) 45%, transparent),
                transparent 80%
            ),
            radial-gradient(
                55% 55% at 10% 80%,
                color-mix(in oklab, light-dark(${palette.brightPurple}, ${palette.fadedPurple}) 40%, transparent),
                transparent 75%
            ),
            radial-gradient(
                50% 50% at 90% 85%,
                color-mix(in oklab, light-dark(${palette.brightBlue}, ${palette.fadedBlue}) 35%, transparent),
                transparent 75%
            )
        `,
    },
});

export type ShellBackground = keyof typeof shellBackground;
