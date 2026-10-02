import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { radius, space } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        flex: 1,
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
        padding: space['4'],
        borderRadius: { default: radius.none, '@media (min-width: 1024px)': radius.md },
    },
});

export interface StageProps extends Omit<React.ComponentProps<'section'>, 'style'> {
    label?: string;
    children?: React.ReactNode;
    style?: StyleXStyles;
}

export function Stage({ label = 'stage', children, style, ...props }: StageProps) {
    return (
        <section aria-label={label} {...props} {...stylex.props(styles.base, style)}>
            {children}
        </section>
    );
}
