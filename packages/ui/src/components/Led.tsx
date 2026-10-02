import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { colorText } from '../recipes/tint';
import { layout, radius } from '../tokens/const.stylex';
import type { ColorNames } from '../tokens/tint.stylex';

const styles = stylex.create({
    base: {
        flexShrink: 0,
        width: layout.ledAtomSize,
        height: layout.ledAtomSize,
        borderRadius: radius.full,
        backgroundColor: 'currentColor',
    },
    live: {
        filter: 'drop-shadow(0 0 4px currentColor)',
    },
    off: {
        opacity: 0.45,
    },
});

export interface LedProps {
    color: ColorNames;
    live?: boolean;
    off?: boolean;
    style?: StyleXStyles;
}

export function Led({ color, live = false, off = false, style }: LedProps) {
    return (
        <span
            aria-hidden="true"
            {...stylex.props(
                styles.base,
                colorText[color],
                live ? styles.live : null,
                off ? styles.off : null,
                style,
            )}
        />
    );
}
