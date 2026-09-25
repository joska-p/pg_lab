import * as stylex from '@stylexjs/stylex';

import { gruvboxPalette as palette, borderWidth, radius, typography, space } from './const.stylex';

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

export const surface = stylex.defineVars({
    bg: `light-dark(${palette.light0}, ${palette.dark0})`,
    fg: `light-dark(${palette.dark0}, ${palette.light0})`,
});

export type ColorNames =
    | 'neutral'
    | 'aurora'
    | 'solder'
    | 'purple'
    | 'amber'
    | 'error'
    | 'aqua'
    | 'orange';

export const colors = stylex.defineVars({
    neutral: palette.gray245,
    aurora: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
    solder: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,
    purple: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,
    amber: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,
    error: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,
    aqua: `light-dark(${palette.brightAqua}, ${palette.fadedAqua})`,
    orange: `light-dark(${palette.brightOrange}, ${palette.fadedOrange})`,
} as const satisfies Record<ColorNames, string>);

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

export const gaps = stylex.create({
    '0': { gap: space['0'] },
    '1': { gap: space['1'] },
    '2': { gap: space['2'] },
    '3': { gap: space['3'] },
    '4': { gap: space['4'] },
    '5': { gap: space['5'] },
    '6': { gap: space['6'] },
    '8': { gap: space['8'] },
    '10': { gap: space['10'] },
    '12': { gap: space['12'] },
    '16': { gap: space['16'] },
});

export const borders = stylex.create({
    subtle: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${borderColor.color} 10%, transparent)`,
    },

    strong: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${borderColor.color} 20%, transparent)`,
    },

    hover: {
        ':hover': {
            borderColor: `color-mix(in oklab, ${borderColor.color} 30%, transparent)`,
        },
    },

    focus: {
        ':focus-visible': {
            outline: `1px solid ${borderColor.color}`,
            outlineOffset: '2px',
        },
    },

    rounded: {
        borderRadius: radius.md,
    },
});

export const elevations = stylex.create({
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

export type Elevation = keyof typeof elevations;

export const interactions = stylex.create({
    base: {
        cursorPointer: 'pointer',
        cursorProgress: 'progress',
        cursorNotAllowed: 'not-allowed',
        disabledOpacity: 0.45,
        pressScale: 0.98,
    },
    disabled: {
        cursor: 'not-allowed',
        opacity: 0.45,
    },
    pressable: {
        cursor: 'pointer',
        transitionProperty: 'background-color, border-color, color, box-shadow, transform',
        transitionDuration: '120ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transform: {
            default: null,
            ':active': 'scale(0.98)',
        },
    },
});

/* -------------------------------------------------------------------------- */
/* themed — pose les vars couleur (border/shadow/background) pour un nom      */
/* sémantique donné. Deux variantes, honnêtes sur ce qu'elles peignent :      */
/* -------------------------------------------------------------------------- */

export const themed = stylex.create({
    // Bordure + ombre teintées, PAS de fond. Pour les surfaces passives
    // (Card, Panel...) qui gardent leur propre fond neutre (surface.bg) et
    // n'utilisent la couleur que comme accent.
    accented: (color: ColorNames) => ({
        [borderColor.color]: colors[color],
        [shadowColor.color]: colors[color],
    }),

    // accented + fond teinté. Pour les surfaces actives qui SONT la couleur
    // (Button, Badge...).
    tinted: (color: ColorNames) => ({
        [backgroundColor.color]: colors[color],
        [borderColor.color]: colors[color],
        [shadowColor.color]: colors[color],
    }),
});

export type SurfaceTint = 'tinted' | 'accented';

/* -------------------------------------------------------------------------- */
/* surfaceStyles — LA recette de composition partagée par tout composant      */
/* "surface" de la lib (Button, Card, futur Input/Badge...). Elle centralise  */
/* ce que signifie "être une surface cohérente" : un seul endroit à changer   */
/* pour faire évoluer tous les composants d'un coup. Chaque composant garde   */
/* sa propre base structurelle (padding, gap, display...) et compose         */
/* simplement avec le résultat de cette fonction.                            */
/* -------------------------------------------------------------------------- */

export function surfaceStyles({
    color = 'neutral',
    tint = 'accented',
    elevation = 'flat',
    disabled = false,
}: {
    color?: ColorNames;
    tint?: SurfaceTint;
    elevation?: Elevation;
    disabled?: boolean;
}) {
    return [
        tint === 'tinted' ? themed.tinted(color) : themed.accented(color),
        tint === 'tinted' && backgrounds.solid,
        borders.subtle,
        borders.rounded,
        elevations[elevation],
        disabled && interactions.disabled,
    ];
}

export const heading = stylex.create({
    level1: {
        margin: 0,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeLg,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.fg,
    },
    level2: {
        margin: 0,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.fg,
    },
    level3: {
        margin: 0,
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.fg,
    },
});

export const fieldText = stylex.create({
    label: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingTight,
        color: surface.fg,
    },
    value: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeSm,
        color: surface.fg,
    },
    message: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        color: colors.orange,
    },
});

export const justifyContent = stylex.create({
    start: {
        justifyContent: 'flex-start',
    },
    center: {
        justifyContent: 'center',
    },
    end: {
        justifyContent: 'flex-end',
    },
    between: {
        justifyContent: 'space-between',
    },
    around: {
        justifyContent: 'space-around',
    },
    evenly: {
        justifyContent: 'space-evenly',
    },
});
