import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surface, staticStyles } from '../styles.stylex';
import type { ColorNames, Elevation, SurfaceTint } from '../styles.stylex';

const cardStyles = stylex.create({
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
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Card({
    elevation = 'flat',
    color = 'neutral',
    tint = 'accented',
    style,
    children,
    ...props
}: CardProps) {
    return (
        <div
            {...props}
            {...stylex.props(cardStyles.base, staticStyles({ color, elevation, tint }), style)}
        >
            {children}
        </div>
    );
}
