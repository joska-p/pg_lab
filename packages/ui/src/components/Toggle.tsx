import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, motion, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    input: {
        appearance: 'none',
        position: 'relative',
        flexShrink: 0,
        margin: 0,
        padding: 0,
        width: layout.toggleTrackWidth,
        height: layout.toggleTrackHeight,

        // Zone de clic élargie.
        '::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: layout.controlTouchTarget,
            height: layout.controlTouchTarget,
        },

        // Bouton : prend `currentColor`, se décale et s'opacifie quand :checked.
        '::after': {
            content: '""',
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: layout.toggleKnobSize,
            height: layout.toggleKnobSize,
            borderRadius: '50%',
            pointerEvents: 'none',
            backgroundColor: 'currentColor',
            opacity: {
                default: 0.5,
                ':checked': 1,
            },
            transform: {
                default: 'translateX(0)',
                ':checked': `translateX(${layout.toggleKnobTravel})`,
            },
            transitionProperty: 'transform, opacity',
            transitionDuration: {
                default: motion.durationFast,
                '@media (prefers-reduced-motion: reduce)': '1ms',
            },
            transitionTimingFunction: motion.easingOut,
        },
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface ToggleProps
    extends
        Omit<
            React.ComponentProps<'input'>,
            'style' | 'className' | 'color' | 'type' | 'role' | 'onChange'
        >,
        SurfaceProps {
    label?: string;
    onCheckedChange?: (checked: boolean) => void;
    style?: LayoutStyle;
}

export function Toggle({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'full',
    elevation = 'flat',
    checked,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: ToggleProps) {
    const id = useId();
    const controlId = idProp ?? id;

    return (
        <div {...stylex.props(styles.row)}>
            {label ? (
                <label
                    htmlFor={controlId}
                    {...stylex.props(fieldText.label, disabled && styles.labelDisabled)}
                >
                    {label}
                </label>
            ) : null}

            <input
                {...props}
                id={controlId}
                type="checkbox"
                role="switch"
                checked={checked}
                defaultChecked={defaultChecked}
                disabled={disabled}
                onChange={(event) => onCheckedChange?.(event.target.checked)}
                {...stylex.props(
                    styles.input,
                    surfaceStyles({ color, background, border, radius, elevation }),
                    interactionStyles({ disabled }),
                    style,
                )}
            />
        </div>
    );
}
