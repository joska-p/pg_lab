import * as stylex from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surface, surfaceStyles } from '../surface.stylex';
import { tintVars } from '../tint.stylex';

const styles = stylex.create({
    base: {
        width: '100%',
        height: '100dvh',
        [tintVars.background]: surface.background,

        padding: space['0'],
        '@media (min-width: 1024px)': {
            padding: space['4'],
        },
    },
});

interface ShellWrapperProps extends Omit<React.ComponentProps<'div'>, 'style'> {
    children?: React.ReactNode;
    style?: stylex.StyleXStyles;
}

export function ShellWrapper({ children, style, ...props }: ShellWrapperProps) {
    const compoundStyle = stylex.props(
        styles.base,
        surfaceStyles({
            color: 'neutral',
            bg: 'chaos',
            elevation: 'flat',
            border: false,
            shadow: false,
            background: true,
        }),
        style,
    );

    return (
        <div {...props} {...compoundStyle}>
            {children}
        </div>
    );
}
