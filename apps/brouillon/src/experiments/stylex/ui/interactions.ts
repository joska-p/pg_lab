import * as stylex from '@stylexjs/stylex';

import { interaction, motion } from './const.stylex';
import { surface } from './surface.stylex';

// Ce que ça fait (survol, appui, focus, état) — par opposition à surface.ts
// qui décrit ce que c'est. N'utilise que des vars de thème (surface.foreground),
// donc fonctionne quel que soit le fond ou la teinte.
export const interactions = stylex.create({
    pressable: {
        cursor: interaction.cursorPointer,
        transitionProperty: 'background-color, border-color, color, box-shadow, transform',
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
    // Voile du foreground par-dessus le fond : fonce en clair, éclaircit en sombre,
    // sans light-dark() (invalide hors couleurs). Un gradient ne s'anime pas : le
    // changement est instantané, le reste (scale, bordure...) garde sa transition.
    overlay: {
        backgroundImage: {
            default: null,
            ':hover': `linear-gradient(color-mix(in oklab, ${surface.foreground} 8%, transparent), color-mix(in oklab, ${surface.foreground} 8%, transparent))`,
            ':active': `linear-gradient(color-mix(in oklab, ${surface.foreground} 14%, transparent), color-mix(in oklab, ${surface.foreground} 14%, transparent))`,
        },
    },
    focus: {
        ':focus-visible': {
            outline: `2px solid ${surface.foreground}`,
            outlineOffset: '2px',
        },
    },
    disabled: {
        cursor: interaction.cursorNotAllowed,
        opacity: interaction.disabledOpacity,
    },
});

export function interactionStyles({ disabled = false }: { disabled?: boolean } = {}) {
    return [
        !disabled && interactions.pressable,
        !disabled && interactions.overlay,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
