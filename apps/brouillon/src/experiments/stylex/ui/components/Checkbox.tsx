import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useRef, useState } from 'react';

import { interaction, layout, radius, space } from '../const.stylex';
import { interactionStyles } from '../interactions.stylex';
import { surface, surfaceStyles } from '../surface.stylex';
import type { Background, Elevation, Borders } from '../surface.stylex';
import { colorText } from '../tint.stylex';
import type { ColorNames } from '../tint.stylex';
import { fieldText } from '../typography.stylex';

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
        borderRadius: radius.sm,
        backgroundColor: surface.background,
        color: surface.foreground,
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

interface CheckboxProps extends Omit<React.ComponentProps<'button'>, 'style'> {
    label?: string;
    color?: ColorNames;
    background?: Background;
    border?: Borders;
    elevation?: Elevation;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
}

export function Checkbox({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
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
    const labelId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : internal;

    const compoundButtonStyle = stylex.props(
        styles.box,
        surfaceStyles({
            color,
            background,
            border,
            elevation,
        }),
        isOn && background != 'solid' ? colorText[color] : null,
        interactionStyles({ disabled }),
        style,
    );

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
                    id={labelId}
                    htmlFor={controlId}
                    onClick={() => buttonRef.current?.click()}
                    {...stylex.props(fieldText.label, disabled && styles.labelDisabled)}
                >
                    {label}
                </label>
            ) : null}

            <button
                aria-labelledby={label ? labelId : undefined}
                {...props}
                ref={buttonRef}
                id={controlId}
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={handleClick}
                disabled={disabled}
                {...compoundButtonStyle}
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
