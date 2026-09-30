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
        transitionProperty: 'background-color, border-color, color, box-shadow, transform, filter',
        transitionDuration: {
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
            filter: 'light-dark(brightness(0.96), brightness(1.1))',
        },
    },
    active: {
        ':active': {
            filter: 'light-dark(brightness(0.92), brightness(1.18))',
        },
    },
    focus: {
        ':focus-visible': {
            outline: `2px solid ${tintVars.border}`,
            outlineOffset: '2px',
        },
    },
    disabled: {
        cursor: interaction.cursorNotAllowed,
        opacity: interaction.disabledOpacity,
    },
});

// Branche a l'identique du comportement actuel de Button (pressable +
// hover + focus), avec pressable/hover coupes si disabled.
export function interactionStyles({ disabled = false }: { disabled?: boolean } = {}) {
    return [
        !disabled && interactions.pressable,
        !disabled && interactions.hover,
        !disabled && interactions.active,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
