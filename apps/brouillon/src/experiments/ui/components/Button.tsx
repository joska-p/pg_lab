import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { typography, space } from '../const.stylex';
import { interactions, surface, surfaceStyles, backgrounds } from '../styles.stylex';
import type { ColorNames } from '../styles.stylex';

const styles = stylex.create({
    base: {
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['4'],
        color: surface.fg,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
    },
});

type ButtonProps = {
    color?: ColorNames;
    disabled?: boolean;
    style?: StyleXStyles;
} & Omit<React.ComponentProps<'button'>, 'style'>;

export function Button({
    color = 'neutral',
    disabled = false,
    style,
    children,
    ...props
}: ButtonProps) {
    const compoundStyle = stylex.props(
        styles.base,
        surfaceStyles({ color, tint: 'tinted', elevation: 'raised', disabled }),
        interactions.pressable,
        disabled && interactions.disabled,
        backgrounds.hover,
        style,
    );

    return (
        <button {...props} type={props.type ?? 'button'} disabled={disabled} {...compoundStyle}>
            {children}
        </button>
    );
}
