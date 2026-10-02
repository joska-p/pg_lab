import * as stylex from '@stylexjs/stylex';

import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { layout, typography, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['1'],
        paddingBlock: layout.chipPadBlock,
        paddingInline: space['2'],
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
    },
});

interface BadgeProps
    extends Omit<React.ComponentProps<'span'>, 'style' | 'className' | 'color'>, SurfaceProps {
    disabled?: boolean;
    style?: LayoutStyle;
    children?: React.ReactNode;
}

export function Badge({
    color = 'neutral',
    background = 'solid',
    border = 'subtle',
    radius = 'full',
    elevation = 'raised',
    style,
    children,
}: BadgeProps) {
    return (
        <span
            {...stylex.props(
                styles.base,
                surfaceStyles({ color, background, border, radius, elevation }),
                style,
            )}
        >
            {children}
        </span>
    );
}
