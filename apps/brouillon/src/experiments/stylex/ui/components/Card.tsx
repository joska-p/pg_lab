import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surface, staticStyles } from '../styles.stylex';
import type { ColorNames, Elevation, SurfaceTint, Background } from '../styles.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
        backgroundColor: surface.bg,
        color: surface.fg,
    },
});

interface CardProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    elevation?: Elevation;
    color?: ColorNames;
    tint?: SurfaceTint;
    bg?: Background;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Card({
    elevation = 'flat',
    color = 'neutral',
    tint = 'accented',
    bg = 'soft',
    style,
    children,
    ...props
}: CardProps) {
    return (
        <div
            {...props}
            {...stylex.props(styles.base, staticStyles({ color, elevation, tint, bg }), style)}
        >
            {children}
        </div>
    );
}
