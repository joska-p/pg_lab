import * as stylex from '@stylexjs/stylex';

import { radius, space } from '../const.stylex';
import { elevations, surface } from '../styles.stylex';

const styles = stylex.create({
    base: {
        flex: 1,
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: space['4'],
        backgroundColor: surface.bg,
        color: surface.fg,
        borderRadius: { default: radius.none, '@media (min-width: 1024px)': radius.md },
    },
});

interface StageProps extends Omit<React.ComponentProps<'section'>, 'style'> {
    children?: React.ReactNode;
    style?: stylex.StyleXStyles;
}

export function Stage({ children, style, ...props }: StageProps) {
    const compoundStyle = stylex.props(styles.base, elevations.raised, style);

    return (
        <section {...props} {...compoundStyle}>
            {children}
        </section>
    );
}
