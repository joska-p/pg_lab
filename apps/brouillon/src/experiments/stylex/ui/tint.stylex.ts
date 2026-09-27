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

// Statique et enumere (pas de dynamic styles) : ColorNames est un ensemble
// ferme de 8 valeurs connues a la compilation, donc chaque couleur devient
// une classe atomique reutilisee entre toutes les instances qui la
// partagent, plutot qu'un style inline recalcule a chaque render.
//
// Volontairement non exportes : ce sont des briques internes. Les
// consommateurs passent par `surfaceTint()` ci-dessous, qui combine les
// trois canaux (background/border/shadow) via des flags independants
// plutot que par un enum de combinaisons nommees (ex. "accented"/"tinted")
// — une surface peut vouloir n'importe quel sous-ensemble des trois.
const tintBackground = stylex.create({
    neutral: { [tintVars.background]: colors.neutral },
    aurora: { [tintVars.background]: colors.aurora },
    solder: { [tintVars.background]: colors.solder },
    purple: { [tintVars.background]: colors.purple },
    amber: { [tintVars.background]: colors.amber },
    error: { [tintVars.background]: colors.error },
    aqua: { [tintVars.background]: colors.aqua },
    orange: { [tintVars.background]: colors.orange },
});

const tintBorder = stylex.create({
    neutral: { [tintVars.border]: colors.neutral },
    aurora: { [tintVars.border]: colors.aurora },
    solder: { [tintVars.border]: colors.solder },
    purple: { [tintVars.border]: colors.purple },
    amber: { [tintVars.border]: colors.amber },
    error: { [tintVars.border]: colors.error },
    aqua: { [tintVars.border]: colors.aqua },
    orange: { [tintVars.border]: colors.orange },
});

const tintShadow = stylex.create({
    neutral: { [tintVars.shadow]: colors.neutral },
    aurora: { [tintVars.shadow]: colors.aurora },
    solder: { [tintVars.shadow]: colors.solder },
    purple: { [tintVars.shadow]: colors.purple },
    amber: { [tintVars.shadow]: colors.amber },
    error: { [tintVars.shadow]: colors.error },
    aqua: { [tintVars.shadow]: colors.aqua },
    orange: { [tintVars.shadow]: colors.orange },
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

/**
 * Applique une couleur a un sous-ensemble des 3 canaux de teinte (background/border/shadow),
 * independamment les uns des autres.
 *
 * Par defaut : border + shadow, background off. `surfaceStyles()` dans surface.stylex.ts s'appuie
 * dessus pour ajouter le remplissage visuel (backgrounds/borders/elevations).
 */
export function surfaceTint({
    color = 'neutral',
    background = false,
    border = true,
    shadow = true,
}: {
    color?: ColorNames;
    background?: boolean;
    border?: boolean;
    shadow?: boolean;
}) {
    return [
        background && tintBackground[color],
        border && tintBorder[color],
        shadow && tintShadow[color],
    ];
}
