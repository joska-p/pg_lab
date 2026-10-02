import * as stylex from '@stylexjs/stylex';

import { interaction, motion, palette } from '../tokens/const.stylex';
import { surface } from '../tokens/surface.stylex';
import { tintVars } from '../tokens/tint.stylex';

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
    // Boost néon en 2 temps par-dessus `elevations.raised` (repos subtil).
    // Lit tintVars.color : fonctionne quelle que soit la teinte, sans nouvelle prop.
    // Les wells (focus seul) n'y touchent pas — seuls les pressables glow.
    glow: {
        boxShadow: {
            default: null,
            ':hover': `
                0 1px 3px color-mix(in oklab, ${palette.dark0Hard} 22%, transparent),
                0 0 20px -2px color-mix(in oklab, ${tintVars.color} 32%, transparent)
            `,
            ':active': `
                0 1px 2px color-mix(in oklab, ${palette.dark0Hard} 20%, transparent),
                0 0 28px -1px color-mix(in oklab, ${tintVars.color} 48%, transparent)
            `,
        },
    },
    focus: {
        ':focus-visible': {
            outlineStyle: 'solid',
            outlineWidth: '2px',
            outlineColor: surface.foreground,
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
        !disabled && interactions.glow,
        interactions.focus,
        disabled && interactions.disabled,
    ];
}
