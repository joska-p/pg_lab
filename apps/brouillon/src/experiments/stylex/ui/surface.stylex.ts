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
    chaos: {
        backgroundColor: surface.background,
        backgroundImage: `
      radial-gradient(45% 35% at 4% 6%, color-mix(in oklab, ${palette.brightRed} 30%, transparent), transparent 70%),
      radial-gradient(40% 35% at 96% 8%, color-mix(in oklab, ${palette.brightOrange} 28%, transparent), transparent 70%),
      radial-gradient(50% 40% at 88% 88%, color-mix(in oklab, ${palette.brightYellow} 26%, transparent), transparent 70%),
      radial-gradient(45% 45% at 8% 92%, color-mix(in oklab, ${palette.brightGreen} 28%, transparent), transparent 70%),
      radial-gradient(55% 40% at 50% 0%, color-mix(in oklab, ${palette.brightAqua} 24%, transparent), transparent 70%),
      radial-gradient(50% 50% at 100% 55%, color-mix(in oklab, ${palette.brightBlue} 30%, transparent), transparent 70%),
      radial-gradient(45% 40% at 0% 50%, color-mix(in oklab, ${palette.brightPurple} 28%, transparent), transparent 70%),
      radial-gradient(35% 30% at 50% 55%, color-mix(in oklab, ${palette.neutralYellow} 20%, transparent), transparent 70%),
      linear-gradient(160deg, color-mix(in oklab, ${palette.gray244} 20%, transparent), transparent 65%)
    `,
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
        borderColor: `color-mix(in oklab, ${tintVars.border} 10%, transparent)`,
        borderRadius: radius.md,
    },

    strong: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${tintVars.border} 20%, transparent)`,
        borderRadius: radius.md,
    },
});

export type Borders = keyof typeof borders;

export const elevations = stylex.create({
    flat: {
        boxShadow: 'none',
    },

    raised: {
        boxShadow: `0 2px 8px color-mix(in oklab, ${tintVars.shadow} 36%, transparent)`,
    },

    sunken: {
        boxShadow: `
            inset 0 1px 0
                color-mix(in oklab, ${tintVars.shadow} 88%, transparent),
            inset 0 1px 3px
                color-mix(in oklab, ${tintVars.shadow} 16%, transparent)
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
