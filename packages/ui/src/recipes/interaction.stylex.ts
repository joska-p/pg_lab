import * as stylex from '@stylexjs/stylex';

import { colors } from '../tokens/colors.stylex';
import { interaction, layout } from '../tokens/layout.stylex';
import { motion } from '../tokens/motion.stylex';
import { shadows } from '../tokens/shadows.stylex';

export const interactive = stylex.create({
    base: {
        cursor: interaction.cursorPointer,
        transitionDuration: {
            default: motion.durationFast,
            '@media (prefers-reduced-motion: reduce)': '1ms',
        },
        transitionTimingFunction: motion.easingOut,
        transitionProperty: 'background-color, border-color, color, box-shadow, opacity, transform',
    },
});

export const pressable = stylex.create({
    base: {
        outline: 'none',
        boxShadow: {
            default: shadows.rest,
            ':hover': shadows.hover,
            ':active': shadows.active,
            ':focus-visible': `${shadows.rest}, 0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },
});

export const focusRing = stylex.create({
    base: {
        outline: 'none',
        boxShadow: {
            default: null,
            ':focus-visible': `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },
});

export const disabled = stylex.create({
    base: {
        cursor: interaction.cursorNotAllowed,
        opacity: interaction.disabledOpacity,
    },
});

export const touch = stylex.create({
    hit: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: layout.controlTouchTarget,
        height: layout.controlTouchTarget,
    },
});

export const active = stylex.create({
    fill: (color: string) => ({
        backgroundColor: color,
        borderColor: color,
    }),
    knob: {
        backgroundColor: colors.background,
    },
});

// Aliases for seamless migration
export const interactiveBase = interactive;
export const disabledStyle = disabled;
