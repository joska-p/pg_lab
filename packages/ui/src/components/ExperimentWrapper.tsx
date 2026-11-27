import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { shellBackground } from '../recipes/shellBackground';
import type { ShellBackground } from '../recipes/shellBackground';
import { colors, onColors } from '../tokens/tint.stylex';

const styles = stylex.create({
    base: {
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: colors.neutral,
        color: onColors.neutral,
    },
});

interface ExperimentWrapperProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children?: React.ReactNode;
    background?: ShellBackground;
    style?: StyleXStyles;
}

export function ExperimentWrapper({
    children,
    background = 'lava-flow',
    style,
    ...props
}: ExperimentWrapperProps) {
    return (
        <div {...props} {...stylex.props(styles.base, shellBackground[background], style)}>
            {children}
        </div>
    );
}
