import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surface, surfaceStyles } from '../styles.stylex';
import type { ColorNames, Elevation } from '../styles.stylex';

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

interface CardProps {
    elevation?: Elevation;
    color?: ColorNames;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Card({ elevation = 'flat', color = 'neutral', style, children }: CardProps) {
    const compoundStyle = stylex.props(
        cardStyles.base,
        surfaceStyles({ color, elevation, tint: 'accented' }),
        style,
    );

    return <div {...compoundStyle}>{children}</div>;
}
