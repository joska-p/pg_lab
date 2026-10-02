import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

interface SelectOption<T extends string> {
    value: T;
    label?: string;
}

interface SelectProps<T extends string>
    extends
        Omit<
            React.ComponentProps<'select'>,
            'style' | 'className' | 'color' | 'onChange' | 'value' | 'defaultValue'
        >,
        SurfaceProps {
    label?: string;
    invalid?: boolean;
    errorMessage?: string;
    options: readonly T[] | readonly SelectOption<T>[];
    value?: T;
    defaultValue?: T;
    placeholder?: string;
    onValueChange?: (value: T) => void;
    style?: LayoutStyle;
}

const styles = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    wrap: {
        position: 'relative',
        display: 'flex',
        flex: 1,
        minWidth: 0,
    },
    select: {
        appearance: 'none',
        width: '100%',
        minWidth: 0,
        margin: 0,
        paddingBlock: space['2'],
        paddingLeft: space['3'],
        paddingRight: space['8'],
    },
    chevron: {
        position: 'absolute',
        right: space['3'],
        top: '50%',
        transform: 'translateY(-50%)',
        width: layout.chevronSize,
        height: layout.chevronSize,
        pointerEvents: 'none',
    },
    labelDisabled: {
        opacity: interaction.disabledOpacity,
    },
});

export function Select<T extends string>({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    invalid = false,
    errorMessage,
    options,
    value,
    defaultValue,
    placeholder,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: SelectProps<T>) {
    const id = useId();
    const controlId = idProp ?? id;
    const messageId = useId();

    const items: SelectOption<T>[] = (options as readonly (T | SelectOption<T>)[]).map((option) =>
        typeof option === 'string' ? { value: option } : option,
    );

    // Sans valeur contrôlée : avec placeholder on sélectionne l'option vide,
    // sinon le navigateur sélectionne naturellement la première option.
    const uncontrolledDefault =
        value === undefined ? (defaultValue ?? (placeholder ? '' : undefined)) : undefined;

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

            <div {...stylex.props(styles.wrap)}>
                <select
                    {...props}
                    id={controlId}
                    value={value}
                    defaultValue={uncontrolledDefault}
                    onChange={(event) => onValueChange?.(event.currentTarget.value as T)}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={errorMessage ? messageId : undefined}
                    {...stylex.props(
                        styles.select,
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
                >
                    {placeholder ? (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    ) : null}
                    {items.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label ?? option.value}
                        </option>
                    ))}
                </select>
                <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.chevron)}>
                    <path
                        d="M2.5 4.5 6 8l3.5-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {errorMessage ? (
                <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
                    {errorMessage}
                </span>
            ) : null}
        </div>
    );
}
