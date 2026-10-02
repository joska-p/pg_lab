import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    input: {
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
        paddingBlock: space['2'],
        paddingInline: space['3'],
        resize: 'vertical',
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface TextAreaProps
    extends
        Omit<
            React.ComponentProps<'textarea'>,
            'style' | 'className' | 'color' | 'onChange' | 'value' | 'defaultValue'
        >,
        SurfaceProps {
    label?: string;
    invalid?: boolean;
    errorMessage?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    style?: LayoutStyle;
}

export function TextArea({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    invalid = false,
    errorMessage,
    rows = 3,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: TextAreaProps) {
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

            <textarea
                {...props}
                id={controlId}
                rows={rows}
                value={value}
                defaultValue={defaultValue}
                onChange={(event) => onValueChange?.(event.currentTarget.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={errorMessage ? messageId : undefined}
                {...stylex.props(
                    styles.input,
                    fieldText.value,
                    surfaceStyles({
                        color: invalid ? 'error' : color,
                        background,
                        border,
                        radius,
                        elevation,
                    }),
                    interactionStyles({ disabled }),
                )}
            />

            {errorMessage ? (
                <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
                    {errorMessage}
                </span>
            ) : null}
        </div>
    );
}
