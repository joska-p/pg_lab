import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

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
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

interface NumberFieldProps
    extends
        Omit<
            React.ComponentProps<'input'>,
            | 'style'
            | 'className'
            | 'color'
            | 'type'
            | 'onChange'
            | 'value'
            | 'defaultValue'
            | 'min'
            | 'max'
            | 'step'
        >,
        SurfaceProps {
    label?: string;
    invalid?: boolean;
    errorMessage?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    style?: LayoutStyle;
}

export function NumberField({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    invalid = false,
    errorMessage,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    value,
    defaultValue = 0,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: NumberFieldProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const messageId = useId();
    const [internal, setInternal] = useState(defaultValue);
    const [draft, setDraft] = useState<string | null>(null);
    const [clampNotice, setClampNotice] = useState<string | null>(null);
    const isControlled = value !== undefined;
    const current = isControlled ? value : internal;
    const isInvalid = invalid || clampNotice !== null;
    const message = errorMessage ?? clampNotice;

    function commit(next: number) {
        const clamped = Math.min(max, Math.max(min, next));
        if (clamped !== next) {
            const bound = next < min ? 'minimum' : 'maximum';
            setClampNotice(`value clamped to ${clamped} (${bound})`);
        } else {
            setClampNotice(null);
        }
        if (!isControlled) {
            setInternal(clamped);
        }
        onValueChange?.(clamped);
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const raw = event.currentTarget.value;
        setDraft(raw);
        const parsed = Number(raw);
        if (raw !== '' && !Number.isNaN(parsed)) {
            commit(parsed);
        }
    }

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
                type="number"
                min={min}
                max={max}
                step={step}
                value={draft ?? String(current)}
                onChange={handleChange}
                onBlur={(event) => {
                    props.onBlur?.(event);
                    setDraft(null);
                    setClampNotice(null);
                }}
                disabled={disabled}
                aria-invalid={isInvalid || undefined}
                aria-describedby={message ? messageId : undefined}
                {...stylex.props(
                    styles.input,
                    fieldText.value,
                    surfaceStyles({
                        color: isInvalid ? 'error' : color,
                        background,
                        border,
                        radius,
                        elevation,
                    }),
                    interactionStyles({ disabled }),
                )}
            />

            {message && (
                <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
                    {message}
                </span>
            )}
        </div>
    );
}
