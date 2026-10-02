import * as stylex from '@stylexjs/stylex';

import { borderWidth, radius } from '../tokens/const.stylex';
import { surface } from '../tokens/surface.stylex';
import { tintVars } from '../tokens/tint.stylex';
import type { ColorNames } from '../tokens/tint.stylex';
import { tint } from './tint';

// Ce que c'est : fond plein / voile / rien. Lit tintVars.color.
// Le texte suit le fond : `onColor` sur fond plein, foreground sinon.
export const backgrounds = stylex.create({
    none: {
        backgroundColor: 'transparent',
        color: surface.foreground,
    },
    solid: {
        backgroundColor: tintVars.color,
        color: tintVars.onColor,
    },
    soft: {
        backgroundColor: `color-mix(in oklab, ${tintVars.color} 18%, transparent)`,
        color: surface.foreground,
    },
});

export type Background = keyof typeof backgrounds;

// Bordure seule : le rayon est un axe à part (`corners`).
export const borders = stylex.create({
    none: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: 'transparent',
    },
    subtle: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${tintVars.color} 38%, transparent)`,
    },
    strong: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${tintVars.color} 72%, transparent)`,
    },
});

export type Borders = keyof typeof borders;

export const corners = stylex.create({
    none: { borderRadius: radius.none },
    sm: { borderRadius: radius.sm },
    md: { borderRadius: radius.md },
    lg: { borderRadius: radius.lg },
    xl: { borderRadius: radius.xl },
    full: { borderRadius: radius.full },
});

export type Radius = keyof typeof corners;

export const elevations = stylex.create({
    flat: {
        boxShadow: 'none',
    },
    raised: {
        boxShadow: `0 3px 14px color-mix(in oklab, ${tintVars.color} 60%, transparent)`,
    },
    sunken: {
        boxShadow: `
            inset 0 1px 0
                color-mix(in oklab, ${tintVars.color} 70%, transparent),
            inset 0 3px 8px
                color-mix(in oklab, ${tintVars.color} 35%, transparent)
        `,
    },
});

export type Elevation = keyof typeof elevations;

// Les 5 axes d'une surface, à étendre dans les props de chaque composant.
export interface SurfaceProps {
    color?: ColorNames;
    background?: Background;
    border?: Borders;
    radius?: Radius;
    elevation?: Elevation;
}

/**
 * Concepts in, style out : écrit la teinte (couleur + texte associé via `tint[color]`), puis le
 * remplissage visuel (backgrounds/borders/corners/elevations lisent ces vars). Ne sait rien du
 * survol ou du disabled — voir interactionStyles() dans interactions.ts.
 */
export function surfaceStyles({
    color = 'neutral',
    background = 'soft',
    border = 'subtle',
    radius = 'md',
    elevation = 'flat',
}: SurfaceProps = {}) {
    return [
        tint[color],
        backgrounds[background],
        borders[border],
        corners[radius],
        elevations[elevation],
    ];
}
