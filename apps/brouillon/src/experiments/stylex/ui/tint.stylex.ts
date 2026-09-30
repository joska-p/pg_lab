import * as stylex from '@stylexjs/stylex';

import { palette } from './const.stylex';

// Les 3 vars CSS qu'une surface teintee expose a ses enfants. Regroupees
// dans un seul objet (comme `surface`) plutot qu'en 3 exports separes :
// elles forment un seul concept ("la teinte de cette surface"), toujours
// lues et ecrites ensemble.
export const tintVars = stylex.defineVars({
    background: 'transparent',
    border: 'transparent',
    shadow: 'transparent',
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
    neutral: `light-dark(${palette.light4}, ${palette.dark4})`,
    aurora: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
    solder: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,
    purple: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,
    amber: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,
    error: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,
    aqua: `light-dark(${palette.brightAqua}, ${palette.fadedAqua})`,
    orange: `light-dark(${palette.brightOrange}, ${palette.fadedOrange})`,
} as const satisfies Record<ColorNames, string>);

// Une seule map : les 3 canaux sont toujours ecrits ensemble (voir
// surfaceStyles() dans surface.stylex.ts). Trois maps separees
// (tintBackground/tintBorder/tintShadow) ne feraient que tripliquer
// chaque couleur sans jamais servir independamment.
export const tint = stylex.create({
    neutral: {
        [tintVars.background]: colors.neutral,
        [tintVars.border]: colors.neutral,
        [tintVars.shadow]: colors.neutral,
    },
    aurora: {
        [tintVars.background]: colors.aurora,
        [tintVars.border]: colors.aurora,
        [tintVars.shadow]: colors.aurora,
    },
    solder: {
        [tintVars.background]: colors.solder,
        [tintVars.border]: colors.solder,
        [tintVars.shadow]: colors.solder,
    },
    purple: {
        [tintVars.background]: colors.purple,
        [tintVars.border]: colors.purple,
        [tintVars.shadow]: colors.purple,
    },
    amber: {
        [tintVars.background]: colors.amber,
        [tintVars.border]: colors.amber,
        [tintVars.shadow]: colors.amber,
    },
    error: {
        [tintVars.background]: colors.error,
        [tintVars.border]: colors.error,
        [tintVars.shadow]: colors.error,
    },
    aqua: {
        [tintVars.background]: colors.aqua,
        [tintVars.border]: colors.aqua,
        [tintVars.shadow]: colors.aqua,
    },
    orange: {
        [tintVars.background]: colors.orange,
        [tintVars.border]: colors.orange,
        [tintVars.shadow]: colors.orange,
    },
});

export const colorText = stylex.create({
    neutral: { color: colors.neutral },
    aurora: { color: colors.aurora },
    solder: { color: colors.solder },
    purple: { color: colors.purple },
    amber: { color: colors.amber },
    error: { color: colors.error },
    aqua: { color: colors.aqua },
    orange: { color: colors.orange },
});
