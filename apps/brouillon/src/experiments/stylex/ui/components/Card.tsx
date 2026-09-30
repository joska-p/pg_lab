import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surface, surfaceStyles } from '../surface.stylex';
import type { Background, Elevation, Borders } from '../surface.stylex';
import type { ColorNames } from '../tint.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
        backgroundColor: surface.background,
        color: surface.foreground,
    },
});

interface CardProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    color?: ColorNames;
    background?: Background;
    border?: Borders;
    elevation?: Elevation;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function Card({
    elevation = 'flat',
    color = 'neutral',
    border = 'subtle',
    background = 'soft',
    style,
    children,
    ...props
}: CardProps) {
    const compoundStyle = stylex.props(
        styles.base,
        surfaceStyles({
            color,
            background,
            border,
            elevation,
        }),
        style,
    );

    return (
        <div {...props} {...compoundStyle}>
            {children}
        </div>
    );
}
