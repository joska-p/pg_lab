import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { radius } from '../const.stylex';

const styles = stylex.create({
    base: {
        flex: 1,
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
        borderRadius: { default: radius.none, '@media (min-width: 1024px)': radius.md },
    },
});

interface StageProps extends Omit<React.ComponentProps<'section'>, 'style' | 'className'> {
    children?: React.ReactNode;
    style?: StyleXStyles;
}

export function Stage({ children, style, ...props }: StageProps) {
    return (
        <section {...props} {...stylex.props(styles.base, style)}>
            {children}
        </section>
    );
}
