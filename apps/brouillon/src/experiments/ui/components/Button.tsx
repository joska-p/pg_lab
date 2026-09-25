import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { typography, space } from '../const.stylex';
import { surface, staticStyles, dynamicStyles } from '../styles.stylex';
import type { ColorNames, Elevation, SurfaceTint } from '../styles.stylex';

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

interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'style'> {
    color?: ColorNames;
    tint?: SurfaceTint;
    elevation?: Elevation;
    disabled?: boolean;
    style?: StyleXStyles;
}

export function Button({
    color = 'neutral',
    tint = 'tinted',
    elevation = 'raised',
    disabled = false,
    style,
    type = 'button',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            {...stylex.props(
                styles.base,
                staticStyles({ color, tint, elevation }),
                dynamicStyles({ disabled }),
                style,
            )}
        >
            {children}
        </button>
    );
}
