import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId } from 'react';

import { wellStyles } from '../recipes/fields';
import { fieldText } from '../recipes/typography';
import { interaction, space } from '../tokens/const.stylex';

const styles = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface TextInputProps extends Omit<
    React.ComponentProps<'input'>,
    'style' | 'className' | 'color' | 'type' | 'onChange' | 'value' | 'defaultValue'
> {
    label?: string;
    invalid?: boolean;
    errorMessage?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    style?: StyleXStyles;
}

export function TextInput({
    label,
    invalid = false,
    errorMessage,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: TextInputProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const messageId = useId();

    return (
        <div {...stylex.props(styles.col, style)}>
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
                type="text"
                value={value}
                defaultValue={defaultValue}
                onChange={(event) => onValueChange?.(event.currentTarget.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={errorMessage ? messageId : undefined}
                {...stylex.props(fieldText.value, ...wellStyles({ invalid, disabled }))}
            />

            {errorMessage ? (
                <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
                    {errorMessage}
                </span>
            ) : null}
        </div>
    );
}
