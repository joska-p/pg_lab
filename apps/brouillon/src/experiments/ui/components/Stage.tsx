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

interface StageProps {
    children?: React.ReactNode;
}

export function Stage({ children }: StageProps) {
    const compoundStyle = stylex.props(styles.base, elevations.raised);

    return <section {...compoundStyle}>{children}</section>;
}
