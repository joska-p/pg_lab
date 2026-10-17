import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexWrap: 'wrap',
    },
});

const directions = stylex.create({
    vertical: { flexDirection: 'column', alignItems: 'stretch' },
    horizontal: { flexDirection: 'row', alignItems: 'center' },
});

const gaps = stylex.create({
    '0': { gap: space['0'] },
    '1': { gap: space['1'] },
    '2': { gap: space['2'] },
    '3': { gap: space['3'] },
    '4': { gap: space['4'] },
    '5': { gap: space['5'] },
    '6': { gap: space['6'] },
    '8': { gap: space['8'] },
    '10': { gap: space['10'] },
    '12': { gap: space['12'] },
    '16': { gap: space['16'] },
});

const justifyContent = stylex.create({
    start: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    end: { justifyContent: 'flex-end' },
    between: { justifyContent: 'space-between' },
    around: { justifyContent: 'space-around' },
    evenly: { justifyContent: 'space-evenly' },
});

const alignItems = stylex.create({
    start: { alignItems: 'flex-start' },
    center: { alignItems: 'center' },
    end: { alignItems: 'flex-end' },
    stretch: { alignItems: 'stretch' },
});

interface StackProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    direction?: keyof typeof directions;
    gap?: keyof typeof gaps;
    justify?: keyof typeof justifyContent;
    alignItem?: keyof typeof alignItems;
    children?: React.ReactNode;
    style?: StyleXStyles;
}

export function Stack({
    direction = 'vertical',
    gap = '3',
    justify = 'start',
    alignItem = 'stretch',
    children,
    style,
    ...props
}: StackProps) {
    return (
        <div
            {...props}
            {...stylex.props(
                styles.base,
                directions[direction],
                gaps[gap],
                justifyContent[justify],
                alignItems[alignItem],
                style,
            )}
        >
            {children}
        </div>
    );
}
