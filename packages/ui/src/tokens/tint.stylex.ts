import * as stylex from '@stylexjs/stylex';

import { palette } from './const.stylex';

// La teinte d'une surface : une seule var (couleur), lue par le fond, la
// bordure et l'ombre qui la dosent chacun avec leur propre color-mix.
// `onColor` = couleur de texte lisible quand la teinte sert de fond plein.
export const tintVars = stylex.defineVars({
    color: 'transparent',
    onColor: `light-dark(${palette.dark0}, ${palette.light0})`,
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

// Texte posé sur un fond plein de la teinte correspondante. Sombre en clair,
// clair en sombre, sauf amber dont le fond "faded" reste trop clair pour du
// texte clair (voir contraste).
export const onColors = stylex.defineVars({
    neutral: `light-dark(${palette.dark0}, ${palette.light0})`,
    aurora: `light-dark(${palette.dark0}, ${palette.light0})`,
    solder: `light-dark(${palette.dark0}, ${palette.light0})`,
    purple: `light-dark(${palette.dark0}, ${palette.light0})`,
    amber: `light-dark(${palette.dark0}, ${palette.light0})`,
    error: `light-dark(${palette.dark0}, ${palette.light0})`,
    aqua: `light-dark(${palette.dark0}, ${palette.light0})`,
    orange: `light-dark(${palette.dark0}, ${palette.light0})`,
} as const satisfies Record<ColorNames, string>);
