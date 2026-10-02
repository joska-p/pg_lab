import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

interface SegmentOption<T extends string> {
    value: T;
    label?: string;
}

interface SegmentedProps<T extends string> extends SurfaceProps {
    label?: string;
    options: readonly T[] | readonly SegmentOption<T>[];
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
        alignItems: 'center',
        gap: space['3'],
        flexWrap: 'wrap',
    },
    // Le conteneur garde la bordure de la surface mais pas son fond,
    // pour que le segment choisi (plein) ressorte.
    group: {
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: space['1'],
        padding: space['1'],
        backgroundColor: 'transparent',
    },
    option: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBlock: space['2'],
        paddingInline: space['3'],
        // Anneau de focus piloté par l'input radio contenu dans le label.
        outline: {
            default: 'none',
            [stylex.when.descendant(':focus-visible')]: '2px solid currentColor',
        },
        outlineOffset: '2px',
    },
    // Segment non choisi : même gabarit que le choisi, mais sans fond ni bordure visibles.
    idle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
    },
    // Input natif invisible qui recouvre tout le segment : clavier, focus et formulaire natifs.
    input: {
        appearance: 'none',
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        opacity: 0,
        cursor: 'inherit',
    },
});

export function Segmented<T extends string>({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    options,
    value,
    defaultValue,
    onValueChange,
    name: nameProp,
    disabled = false,
    id: idProp,
    style,
}: SegmentedProps<T>) {
    const id = useId();
    const groupId = idProp ?? id;
    const generatedName = useId();
    const name = nameProp ?? generatedName;

    const items: SegmentOption<T>[] = (options as readonly (T | SegmentOption<T>)[]).map(
        (option) => (typeof option === 'string' ? { value: option } : option),
    );
    const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
    const isControlled = value !== undefined;
    const current = isControlled ? value : internal;
    const surface = surfaceStyles({ color, background, border, radius, elevation });

    function commit(next: T) {
        if (!isControlled) {
            setInternal(next);
        }
        onValueChange?.(next);
    }

    // Flèches et roving tabindex : gérés par le navigateur (inputs radio de même `name`).
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
                aria-label={label ? undefined : 'selection'}
                aria-disabled={disabled || undefined}
                {...stylex.props(surface, styles.group, style)}
            >
                {items.map((option) => {
                    const chosen = option.value === current;
                    return (
                        <label
                            key={option.value}
                            {...stylex.props(
                                surface,
                                styles.option,
                                fieldText.value,
                                chosen ? null : styles.idle,
                                interactionStyles({ disabled }),
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={chosen}
                                disabled={disabled}
                                onChange={() => commit(option.value)}
                                {...stylex.props(styles.input, stylex.defaultMarker())}
                            />
                            {option.label ?? option.value}
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
