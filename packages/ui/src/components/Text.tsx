import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { fieldText } from '../recipes/typography';
import { layout } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        margin: 0,
        maxWidth: layout.textMaxWidth,
    },
});

// La couleur est héritée du contexte (surface parente) ; `muted` l'atténue.
const variants = stylex.create({
    default: {},
    muted: {
        opacity: 0.7,
    },
});

interface TextProps {
    variant?: keyof typeof variants;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Text({ variant = 'default', style, children }: TextProps) {
    return (
        <p {...stylex.props(styles.base, fieldText.value, variants[variant], style)}>{children}</p>
    );
}
