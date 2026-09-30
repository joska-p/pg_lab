import * as stylex from '@stylexjs/stylex';

import { interaction, motion } from './const.stylex';
import { tintVars } from './tint.stylex';

// Ce que ca fait (survol, appui, focus, etat) — par opposition a
// surface.stylex.ts qui decrit ce que c'est. Lit tintVars directement :
// peu importe comment le composant a rempli ces vars (surfaceStyles() ou
// autrement), le comportement au survol/focus suit.
export const interactions = stylex.create({
    pressable: {
        cursor: interaction.cursorPointer,
        transitionProperty: 'background-color, border-color, color, box-shadow, transform',
        transitionDuration: {
            // durationSlow (320ms) : le plus proche du 300ms historique.
            // DESIGN.md:253 dit encore 300ms — drift de 20ms a trancher en polish.
            default: motion.durationSlow,
            '@media (prefers-reduced-motion: reduce)': '1ms',
        },
        transitionTimingFunction: motion.easingOut,
        transform: {
            default: null,
            ':active': `scale(${interaction.pressScale})`,
        },
    },
    hover: {
        ':hover': {
            backgroundColor: `light-dark(color-mix(in oklab, ${tintVars.background} 92%, black), color-mix(in oklab, ${tintVars.background} 88%, white))`,
        },
    },
    active: {
        ':active': {
            backgroundColor: `light-dark(color-mix(in oklab, ${tintVars.background} 85%, black), color-mix(in oklab, ${tintVars.background} 80%, white))`,
        },
    },
    borderHover: {
        ':hover': {
            backgroundColor: `light-dark(color-mix(in oklab, ${tintVars.background} 92%, black), color-mix(in oklab, ${tintVars.background} 88%, white))`,
        },
    },
    focus: {
        ':focus-visible': {
            outline: `1px solid ${tintVars.border}`,
            outlineOffset: '2px',
        },
    },
    disabled: {
        cursor: interaction.cursorNotAllowed,
        opacity: interaction.disabledOpacity,
    },
});

// Branche a l'identique du comportement actuel de Button (pressable +
// hover + focus), avec pressable/hover coupes si disabled. `borderHover`
// n'est pas applique ici : il est identique a l'octet a `hover` (voir
// audit P1 #7), le brancher en plus doublait la regle :hover pour rien.
export function interactionStyles({ disabled = false }: { disabled?: boolean } = {}) {
    return [
        !disabled && interactions.pressable,
        !disabled && interactions.hover,
        !disabled && interactions.active,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
