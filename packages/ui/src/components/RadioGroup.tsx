import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { interaction, layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

interface RadioOption<T extends string> {
    value: T;
    label?: string;
}

interface RadioGroupProps<T extends string> extends SurfaceProps {
    label?: string;
    options: readonly T[] | readonly RadioOption<T>[];
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T) => void;
    /** Nom du champ pour les formulaires natifs. Généré automatiquement sinon. */
    name?: string;
    disabled?: boolean;
    id?: string;
    style?: LayoutStyle;
}

const styles = stylex.create({
    row: {
        display: 'flex',
        gap: space['3'],
    },
    options: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
        flex: 1,
        minWidth: 0,
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        minHeight: layout.radioOptionMinHeight,
    },
    optionDisabled: {
        opacity: interaction.disabledOpacity,
    },
    input: {
        appearance: 'none',
        position: 'relative',
        flexShrink: 0,
        margin: 0,
        padding: 0,
        width: layout.radioCircleSize,
        height: layout.radioCircleSize,

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

        // Point central : visible seulement quand :checked, prend `currentColor`.
        '::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: layout.radioDotSize,
            height: layout.radioDotSize,
            borderRadius: '50%',
            pointerEvents: 'none',
            backgroundColor: {
                default: 'transparent',
                ':checked': 'currentColor',
            },
        },
    },
});

export function RadioGroup<T extends string>({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'full',
    elevation = 'flat',
    options,
    value,
    defaultValue,
    onValueChange,
    name: nameProp,
    disabled = false,
    id: idProp,
    style,
}: RadioGroupProps<T>) {
    const id = useId();
    const groupId = idProp ?? id;
    const generatedName = useId();
    const name = nameProp ?? generatedName;
    const isControlled = value !== undefined;

    const items: RadioOption<T>[] = (options as readonly (T | RadioOption<T>)[]).map((option) =>
        typeof option === 'string' ? { value: option } : option,
    );
    const initial = defaultValue ?? items[0]?.value;

    return (
        <div {...stylex.props(styles.row)}>
            {label ? (
                <span id={groupId} {...stylex.props(fieldText.label)}>
                    {label}
                </span>
            ) : null}

            <div
                role="radiogroup"
                aria-labelledby={label ? groupId : undefined}
                aria-disabled={disabled || undefined}
                {...stylex.props(styles.options, style)}
            >
                {items.map((option) => (
                    <label
                        key={option.value}
                        {...stylex.props(
                            styles.option,
                            fieldText.value,
                            disabled && styles.optionDisabled,
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isControlled ? option.value === value : undefined}
                            defaultChecked={isControlled ? undefined : option.value === initial}
                            disabled={disabled}
                            onChange={() => onValueChange?.(option.value)}
                            {...stylex.props(
                                styles.input,
                                surfaceStyles({ color, background, border, radius, elevation }),
                                interactionStyles({ disabled }),
                            )}
                        />
                        {option.label ?? option.value}
                    </label>
                ))}
            </div>
        </div>
    );
}
