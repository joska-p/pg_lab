import * as stylex from '@stylexjs/stylex';

import { gaps, justifyContent } from '../styles.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexWrap: 'wrap',
    },
});

const directions = stylex.create({
    vertical: {
        flexDirection: 'column',
    },
    horizontal: {
        flexDirection: 'row',
    },
});

interface StackProps {
    direction?: keyof typeof directions;
    gap?: keyof typeof gaps;
    justify?: keyof typeof justifyContent;
    children?: React.ReactNode;
}

export function Stack({
    direction = 'vertical',
    gap = '3',
    justify = 'start',
    children,
}: StackProps) {
    const coumpoundStyle = stylex.props(
        styles.base,
        directions[direction],
        gaps[gap],
        justifyContent[justify],
    );

    return <div {...coumpoundStyle}>{children}</div>;
}
