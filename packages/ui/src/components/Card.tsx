import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { elevation } from '../recipes/effects.stylex';
import { colors } from '../tokens/colors.stylex';
import { borderWidth, radius, space } from '../tokens/layout.stylex';
import { shadowColor } from '../tokens/shadows.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
        borderRadius: radius.md,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.card,
        color: colors.cardForeground,
    },
});

const variants = stylex.create({
    surface: {
        [shadowColor.color]: colors.card,
    },
    raised: {
        [shadowColor.color]: colors.card,
    },
    sunken: {
        [shadowColor.color]: colors.muted,
        backgroundColor: colors.muted,
        color: colors.mutedForeground,
    },
});

const variantEffects = {
    surface: null,
    raised: elevation.raised,
    sunken: elevation.sunken,
} satisfies Record<keyof typeof variants, StyleXStyles | null>;

interface CardProps {
    variant?: keyof typeof variants;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Card({ variant = 'surface', style, children }: CardProps) {
    return (
        <div {...stylex.props(styles.base, variants[variant], variantEffects[variant], style)}>
            {children}
        </div>
    );
}
