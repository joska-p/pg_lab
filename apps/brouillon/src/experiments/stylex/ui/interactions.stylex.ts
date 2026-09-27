import * as stylex from '@stylexjs/stylex';

import { tintVars } from './tint.stylex';

// Ce que ca fait (survol, appui, focus, etat) — par opposition a
// surface.stylex.ts qui decrit ce que c'est. Lit tintVars directement :
// peu importe comment le composant a rempli ces vars (surfaceStyles() ou
// autrement), le comportement au survol/focus suit.
//
// `active` et `borderHover` restent definis mais non branches pour le
// moment (voir interactionStyles ci-dessous).
export const interactions = stylex.create({
    pressable: {
        cursor: 'pointer',
        transitionProperty: 'background-color, border-color, color, box-shadow, transform',
        transitionDuration: '1300ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transform: {
            default: null,
            ':active': 'scale(0.98)',
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
        cursor: 'not-allowed',
        opacity: 0.45,
    },
});

// Branche a l'identique du comportement actuel de Button (pressable +
// hover + focus), avec pressable/hover coupes si disabled.
export function interactionStyles({ disabled = false }: { disabled?: boolean } = {}) {
    return [
        !disabled && interactions.pressable,
        !disabled && interactions.hover,
        !disabled && interactions.borderHover,
        !disabled && interactions.active,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
