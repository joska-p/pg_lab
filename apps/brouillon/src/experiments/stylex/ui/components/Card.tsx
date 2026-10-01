import * as stylex from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surfaceStyles } from '../surface';
import type { SurfaceProps } from '../surface';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
    },
});

interface CardProps
    extends Omit<React.ComponentProps<'div'>, 'style' | 'className' | 'color'>, SurfaceProps {
    style?: LayoutStyle;
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
                surfaceStyles({ color, background, border, radius, elevation }),
                style,
            )}
        >
            {children}
        </div>
    );
}
