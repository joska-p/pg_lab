import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { colors } from '../tokens/colors.stylex';
import { families, type FamilyName } from '../tokens/families.stylex';
import { borderWidth, layout, radius, space } from '../tokens/layout.stylex';
import { typography } from '../tokens/typography.stylex';
import { Led } from './Led';

const styles = stylex.create({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['1'],
        paddingBlock: layout.chipPadBlock,
        paddingInline: space['2'],
        borderRadius: radius.full,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
    },
    family: (strong: string) => ({
        color: strong,
        borderColor: `color-mix(in oklab, ${strong} 60%, transparent)`,
    }),
    neutral: {
        color: colors.mutedForeground,
        borderColor: colors.border,
    },
});

interface BadgeProps {
    family?: FamilyName;
    live?: boolean;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Badge({ family, live = false, style, children }: BadgeProps) {
    const fam = family ? families[family] : null;

    return (
        <span
            {...stylex.props(styles.base, fam ? styles.family(fam.strong) : styles.neutral, style)}
        >
            {family ? <Led color={family} live={live} /> : null}
            {children}
        </span>
    );
}
