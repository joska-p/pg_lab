import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { field } from '../recipes/fields';
import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import type { ColorNames } from '../tokens/tint.stylex';
import { Led } from './Led';

interface ColorFieldProps {
    label?: string;
    color?: ColorNames;
    live?: boolean;
    invalid?: boolean;
    errorMessage?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
}

const DEFAULT_HEX = '#000000';

function asHex(value: string) {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (!match) {
        return DEFAULT_HEX;
    }
    const hex = match[1];
    return hex.length === 3 ? `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}` : value;
}

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },

    input: {
        flexShrink: 0,
        width: layout.colorSwatchWidth,
        height: layout.colorSwatchHeight,
        margin: 0,
        padding: layout.colorSwatchPad,
    },

    value: {
        minWidth: space['10'],
    },
});

export function ColorField({
    label,
    color,
    live = false,
    invalid = false,
    errorMessage,
    value,
    defaultValue = DEFAULT_HEX,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
}: ColorFieldProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const messageId = useId();
    const [internal, setInternal] = useState(defaultValue);
    const isControlled = value !== undefined;
    const current = asHex(isControlled ? value : internal);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const next = event.currentTarget.value;
        if (!isControlled) {
            setInternal(next);
        }
        onValueChange?.(next);
    }

    return (
        <div {...stylex.props(field.col, style)}>
            {label || color ? (
                <div {...stylex.props(field.labelRow)}>
                    {color ? <Led color={color} live={live} /> : null}
                    {label ? (
                        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
                            {label}
                        </label>
                    ) : null}
                </div>
            ) : null}

            <div {...stylex.props(styles.row)}>
                <input
                    id={controlId}
                    type="color"
                    value={current}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={errorMessage ? messageId : undefined}
                    {...stylex.props(
                        surfaceStyles({
                            color: invalid ? 'orange' : 'neutral',
                            background: 'soft',
                            border: 'strong',
                            radius: 'sm',
                        }),
                        styles.input,
                        interactionStyles({ disabled }),
                    )}
                />

                <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
                    {current.toUpperCase()}
                </output>
            </div>

            {errorMessage ? (
                <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
                    {errorMessage}
                </span>
            ) : null}
        </div>
    );
}
