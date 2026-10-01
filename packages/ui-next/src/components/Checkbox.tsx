import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    box: {
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: layout.checkboxSize,
        height: layout.checkboxSize,
        padding: 0,
    },
    check: {
        width: layout.checkboxMarkSize,
        height: layout.checkboxMarkSize,
    },
    hit: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: layout.controlTouchTarget,
        height: layout.controlTouchTarget,
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface CheckboxProps
    extends Omit<React.ComponentProps<'button'>, 'style' | 'className' | 'color'>, SurfaceProps {
    label?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    style?: LayoutStyle;
}

export function Checkbox({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    id: idProp,
    style,
    onClick,
    ...props
}: CheckboxProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : internal;

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        onClick?.(event);
        if (event.defaultPrevented || disabled) {
            return;
        }
        const next = !isOn;
        if (!isControlled) {
            setInternal(next);
        }
        onCheckedChange?.(next);
    }

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

            <button
                {...props}
                id={controlId}
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={handleClick}
                disabled={disabled}
                {...stylex.props(
                    styles.box,
                    surfaceStyles({ color, background, border, radius, elevation }),
                    interactionStyles({ disabled }),
                    style,
                )}
            >
                <span aria-hidden {...stylex.props(styles.hit)} />
                {isOn ? (
                    <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.check)}>
                        <path
                            d="M2 6.4 4.8 9 10 3.2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : null}
            </button>
        </div>
    );
}
