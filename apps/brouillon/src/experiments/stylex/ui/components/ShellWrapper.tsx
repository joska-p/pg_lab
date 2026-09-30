import * as stylex from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { surfaceStyles } from '../surface.stylex';

const styles = stylex.create({
    base: {
        width: '100%',
        height: '100dvh',

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
            background: 'chaos',
            elevation: 'flat',
            border: 'subtle',
        }),
        style,
    );

    return (
        <div {...props} {...compoundStyle}>
            {children}
        </div>
    );
}
