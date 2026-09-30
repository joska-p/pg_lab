import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { typography, space } from '../const.stylex';
import { interactionStyles } from '../interactions.stylex';
import { surface, surfaceStyles } from '../surface.stylex';
import type { Background, Elevation, Borders } from '../surface.stylex';
import type { ColorNames } from '../tint.stylex';

const styles = stylex.create({
    base: {
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['2'],
        paddingBlock: space['2'],
        paddingInline: space['4'],
        color: surface.foreground,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
    },
});

interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'style'> {
    color?: ColorNames;
    background?: Background;
    border?: Borders;
    elevation?: Elevation;
    disabled?: boolean;
    style?: StyleXStyles;
}

export function Button({
    color = 'neutral',
    background = 'solid',
    border = 'subtle',
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
                surfaceStyles({
                    color,
                    background,
                    border,
                    elevation,
                }),
                interactionStyles({ disabled }),
                style,
            )}
        >
            {children}
        </button>
    );
}
