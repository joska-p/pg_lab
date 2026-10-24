import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { shellBackground } from '../recipes/shellBackground';
import type { ShellBackground } from '../recipes/shellBackground';
import { surface } from '../tokens/surface.stylex';

const styles = stylex.create({
    base: {
        width: '100%',
        height: '100dvh',
        boxSizing: 'border-box',
        backgroundColor: surface.background,
        color: surface.foreground,
    },
});

interface ShellWrapperProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children?: React.ReactNode;
    background?: ShellBackground;
    style?: StyleXStyles;
}

export function ShellWrapper({
    children,
    background = 'lava-flow',
    style,
    ...props
}: ShellWrapperProps) {
    return (
        <div {...props} {...stylex.props(styles.base, shellBackground[background], style)}>
            {children}
        </div>
    );
}
