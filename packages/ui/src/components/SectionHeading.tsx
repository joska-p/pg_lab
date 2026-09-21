import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { glow } from '../recipes/effects.stylex';
import { heading } from '../recipes/typography.stylex';
import { colors } from '../tokens/colors.stylex';
import { families } from '../tokens/families.stylex';
import { layout, radius, space } from '../tokens/layout.stylex';
import { typography } from '../tokens/typography.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },

    led: {
        display: 'inline-block',
        width: layout.ledAtomSize,
        height: layout.ledAtomSize,
        borderRadius: radius.full,
        backgroundColor: families['neon-violet'].base,
        color: families['neon-violet'].base,
    },

    index: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        color: colors.mutedForeground,
    },
});

type SectionHeadingProps = {
    index?: string;
    title: string;
    style?: StyleXStyles;
};

export function SectionHeading({ index, title, style }: SectionHeadingProps) {
    return (
        <div {...stylex.props(styles.base, style)}>
            <span aria-hidden {...stylex.props(styles.led, glow.glowSubtle)} />
            {index ? <span {...stylex.props(styles.index)}>{index}</span> : null}
            <h2 {...stylex.props(heading.level1)}>{title}</h2>
        </div>
    );
}
