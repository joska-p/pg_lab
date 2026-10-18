import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { space } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        display: 'grid',
        boxSizing: 'border-box',
    },
});

// Gestion du nombre de colonnes basées sur le conteneur
const columnsStyles = stylex.create({
    '1': { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
    '2': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '3': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    '4': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
    '6': { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
    '12': { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' },
    // Option fluide utile : s'adapte automatiquement à la largeur du conteneur
    'auto-fit': { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' },
    'auto-fill': { gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' },
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

const justifyItems = stylex.create({
    start: { justifyItems: 'start' },
    center: { justifyItems: 'center' },
    end: { justifyItems: 'end' },
    stretch: { justifyItems: 'stretch' },
});

const alignItems = stylex.create({
    start: { alignItems: 'start' },
    center: { alignItems: 'center' },
    end: { alignItems: 'end' },
    stretch: { alignItems: 'stretch' },
});

interface GridProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    columns?: keyof typeof columnsStyles;
    gap?: keyof typeof gaps;
    justifyItem?: keyof typeof justifyItems;
    alignItem?: keyof typeof alignItems;
    children?: React.ReactNode;
    style?: StyleXStyles;
}

export function Grid({
    columns = '3',
    gap = '3',
    justifyItem = 'stretch',
    alignItem = 'stretch',
    children,
    style,
    ...props
}: GridProps) {
    return (
        <div
            {...props}
            {...stylex.props(
                styles.base,
                columnsStyles[columns],
                gaps[gap],
                justifyItems[justifyItem],
                alignItems[alignItem],
                style,
            )}
        >
            {children}
        </div>
    );
}
