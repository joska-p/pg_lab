import * as stylex from '@stylexjs/stylex';

import { palette, borderWidth, radius } from './const.stylex';
import { tintVars, tint } from './tint.stylex';
import type { ColorNames } from './tint.stylex';

// Fond/texte neutres par defaut d'une surface, independamment de toute
// teinte (une Card sans couleur reste lisible grace a ca).
export const surface = stylex.defineVars({
    background: `light-dark(${palette.light0}, ${palette.dark0})`,
    foreground: `light-dark(${palette.dark0}, ${palette.light0})`,
});

// Statique : ce que c'est (fond plein ou voile), lit tintVars.background
export const backgrounds = stylex.create({
    none: {
        backgroundColor: 'transparent',
    },
    solid: {
        backgroundColor: tintVars.background,
    },
    soft: {
        backgroundColor: `color-mix(in oklab, ${tintVars.background} 18%, transparent)`,
    },
});

export type Background = keyof typeof backgrounds;

// Statique : ce que c'est (bordure + radius).
export const borders = stylex.create({
    none: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: radius.md,
    },
    subtle: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${tintVars.border} 38%, transparent)`,
        borderRadius: radius.md,
    },

    strong: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${tintVars.border} 72%, transparent)`,
        borderRadius: radius.md,
    },
});

export type Borders = keyof typeof borders;

export const elevations = stylex.create({
    flat: {
        boxShadow: 'none',
    },

    raised: {
        boxShadow: `0 3px 14px color-mix(in oklab, ${tintVars.shadow} 60%, transparent)`,
    },

    sunken: {
        boxShadow: `
            inset 0 1px 0
                color-mix(in oklab, ${tintVars.shadow} 70%, transparent),
            inset 0 3px 8px
                color-mix(in oklab, ${tintVars.shadow} 35%, transparent)
        `,
    },
});

export type Elevation = keyof typeof elevations;

/**
 * Concepts in, style out : ecrit la teinte (les 3 canaux d'un coup via `tint[color]`), puis le
 * remplissage visuel (backgrounds/borders/elevations lisent ces canaux). Ne sait rien du survol ou
 * du disabled — voir interactionStyles() dans interactions.stylex.ts pour ca.
 */
export function surfaceStyles({
    color = 'neutral',
    background = 'soft',
    border = 'subtle',
    elevation = 'flat',
}: {
    color?: ColorNames;
    background?: Background;
    border?: Borders;
    elevation?: Elevation;
} = {}) {
    return [tint[color], backgrounds[background], borders[border], elevations[elevation]];
}
