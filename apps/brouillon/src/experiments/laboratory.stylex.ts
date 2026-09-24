import { gruvboxPalette as palette } from '@repo/ui/tokens/palette.stylex';
import * as stylex from '@stylexjs/stylex';

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

export const surface = stylex.defineVars({
    bg: `light-dark(${palette.light0}, ${palette.dark0})`,
    fg: `light-dark(${palette.dark0}, ${palette.light0})`,
});

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const space = stylex.defineConsts({
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
});

/* -------------------------------------------------------------------------- */
/* Families                                                                   */
/* -------------------------------------------------------------------------- */

export const families = stylex.defineVars({
    neutral: palette.gray245,
    aurora: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
    solder: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,
    'neon-violet': `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,
    amber: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,
    error: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,
    aqua: `light-dark(${palette.brightAqua}, ${palette.fadedAqua})`,
    orange: `light-dark(${palette.brightOrange}, ${palette.fadedOrange})`,
});

export type FamilyName = keyof typeof families;

/* -------------------------------------------------------------------------- */
/* Context variables                                                          */
/*                                                                            */
/* Components bind a family to the effect they want to tint.                 */
/* -------------------------------------------------------------------------- */

export const backgroundColor = stylex.defineVars({
    color: 'transparent',
});

export const borderColor = stylex.defineVars({
    color: 'transparent',
});

export const shadowColor = stylex.defineVars({
    color: 'transparent',
});

export const glowColor = stylex.defineVars({
    color: 'transparent',
});

/* -------------------------------------------------------------------------- */
/* Backgrounds                                                                */
/* -------------------------------------------------------------------------- */

export const backgrounds = stylex.create({
    solid: {
        backgroundColor: backgroundColor.color,
    },

    soft: {
        backgroundColor: `color-mix(in oklab, ${backgroundColor.color} 18%, transparent)`,
    },

    hover: {
        ':hover': {
            backgroundColor: `color-mix(in oklab, ${backgroundColor.color} 42%, transparent)`,
        },
    },

    active: {
        ':active': {
            backgroundColor: `color-mix(in oklab, ${backgroundColor.color} 58%, transparent)`,
        },
    },
});

/* -------------------------------------------------------------------------- */
/* Borders                                                                    */
/* -------------------------------------------------------------------------- */

export const borders = stylex.create({
    subtle: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${borderColor.color} 24%, transparent)`,
    },

    strong: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${borderColor.color} 52%, transparent)`,
    },

    hover: {
        ':hover': {
            borderColor: `color-mix(in oklab, ${borderColor.color} 52%, transparent)`,
        },
    },

    focus: {
        ':focus-visible': {
            outline: `1px solid ${borderColor.color}`,
            outlineOffset: '2px',
        },
    },

    rounded: {
        borderRadius: '6px',
    },
});

/* -------------------------------------------------------------------------- */
/* Shadows                                                                    */
/* -------------------------------------------------------------------------- */

export const shadows = stylex.create({
    flat: {
        boxShadow: 'none',
    },

    raised: {
        boxShadow: `0 2px 8px color-mix(in oklab, ${shadowColor.color} 36%, transparent)`,
    },

    sunken: {
        boxShadow: `
            inset 0 1px 0
                color-mix(in oklab, ${shadowColor.color} 88%, transparent),
            inset 0 1px 3px
                color-mix(in oklab, ${shadowColor.color} 16%, transparent)
        `,
    },
});

/* -------------------------------------------------------------------------- */
/* Glow                                                                       */
/* -------------------------------------------------------------------------- */

export const glows = stylex.create({
    soft: {
        boxShadow: `0 0 12px color-mix(in oklab, ${glowColor.color} 30%, transparent)`,
    },

    strong: {
        boxShadow: `0 0 18px color-mix(in oklab, ${glowColor.color} 48%, transparent)`,
    },
});

/* -------------------------------------------------------------------------- */
/* Interaction                                                                */
/* -------------------------------------------------------------------------- */

export const pressable = stylex.create({
    base: {
        cursor: 'pointer',
        transitionProperty: 'background-color, border-color, color, box-shadow, transform',
        transitionDuration: '120ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },

    press: {
        ':active': {
            transform: 'scale(0.98)',
        },
    },
});

export const disabled = stylex.create({
    base: {
        cursor: 'not-allowed',
        opacity: 0.45,
    },
});
