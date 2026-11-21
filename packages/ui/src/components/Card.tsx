import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { surfaceStyle } from '../recipes/surface';
import type { SurfaceStyleProps } from '../recipes/surface';
import { space } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
    },
});

export interface CardProps
    extends Omit<React.ComponentProps<'div'>, 'style' | 'className' | 'color'>, SurfaceStyleProps {
    style?: StyleXStyles;
}

export function Card({
    color = 'neutral',
    background = 'soft',
    border = 'subtle',
    radius = 'md',
    elevation = 'flat',
    style,
    children,
    ...props
}: CardProps) {
    return (
        <div
            {...props}
            {...stylex.props(
                styles.base,
                surfaceStyle({ color, background, border, radius, elevation }),
                style,
            )}
        >
            {children}
        </div>
    );
}
