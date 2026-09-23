import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useRef, useState } from 'react';

import { disabled as disabledRecipe, interactive, pressable } from '../recipes/interaction.stylex';
import { fieldText } from '../recipes/typography.stylex';
import { colors } from '../tokens/colors.stylex';
import { familiesConsts, type FamilyName } from '../tokens/families.stylex';
import { borderWidth, layout, radius, space } from '../tokens/layout.stylex';
import { shadowColor } from '../tokens/shadows.stylex';

interface SegmentOption<T extends string> {
    value: T;
    label?: string;
}

interface SegmentedProps<T extends string> {
    label?: string;
    family?: FamilyName;
    options: readonly T[] | readonly SegmentOption<T>[];
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
}

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
        flexWrap: 'wrap',
    },

    group: {
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: space['1'],
        padding: space['1'],
        borderRadius: radius.md,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.muted,
    },

    option: {
        paddingBlock: layout.segmentPadBlock,
        paddingInline: space['3'],
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        color: colors.mutedForeground,
        [shadowColor.color]: colors.muted,
    },

    chosenNeutral: {
        backgroundColor: colors.mutedForeground,
        color: colors.background,
        [shadowColor.color]: colors.mutedForeground,
    },
});

const chosenVariants = stylex.create({
    aurora: {
        backgroundColor: familiesConsts.auroraBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.auroraBase,
    },
    solder: {
        backgroundColor: familiesConsts.solderBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.solderBase,
    },
    'neon-violet': {
        backgroundColor: familiesConsts.neonVioletBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.neonVioletBase,
    },
    amber: {
        backgroundColor: familiesConsts.amberBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.amberBase,
    },
    error: {
        backgroundColor: familiesConsts.errorBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.errorBase,
    },
    aqua: {
        backgroundColor: familiesConsts.aquaBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.aquaBase,
    },
    orange: {
        backgroundColor: familiesConsts.orangeBase,
        color: colors.foreground,
        [shadowColor.color]: familiesConsts.orangeBase,
    },
});

export function Segmented<T extends string>(props: SegmentedProps<T>) {
    const {
        label,
        family,
        options,
        value,
        defaultValue,
        onValueChange,
        disabled,
        id: idProp,
        style,
    } = props;

    const id = useId();
    const groupId = idProp ?? id;
    const [internal, setInternal] = useState(defaultValue);
    const isControlled = value !== undefined;
    const items = options.map((option) =>
        typeof option === 'string' ? { value: option } : option,
    );
    const current = isControlled ? value : (internal ?? items[0].value);
    const groupRef = useRef<HTMLDivElement>(null);

    function commit(next: T) {
        if (!isControlled) {
            setInternal(next);
        }
        onValueChange?.(next);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const index = items.findIndex((option) => option.value === current);
        const last = items.length - 1;
        let nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = index >= last ? 0 : index + 1;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = index <= 0 ? last : index - 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = last;
        } else {
            return;
        }

        event.preventDefault();
        commit(items[nextIndex].value);
        (groupRef.current?.children[nextIndex] as HTMLElement | undefined)?.focus();
    }

    return (
        <div {...stylex.props(styles.row)}>
            {label && (
                <label id={groupId} {...stylex.props(fieldText.label)}>
                    {label}
                </label>
            )}

            <div
                ref={groupRef}
                role="radiogroup"
                aria-labelledby={label ? groupId : undefined}
                aria-label={label ? undefined : 'selection'}
                onKeyDown={handleKeyDown}
                {...stylex.props(styles.group, disabled ? disabledRecipe.base : null, style)}
            >
                {items.map((option) => {
                    const chosen = option.value === current;
                    const familyStyle = family ? chosenVariants[family] : styles.chosenNeutral;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={chosen}
                            tabIndex={chosen ? 0 : -1}
                            onClick={() => commit(option.value)}
                            disabled={disabled}
                            {...stylex.props(
                                styles.option,
                                interactive.base,
                                pressable.base,
                                chosen ? familyStyle : null,
                                disabled ? disabledRecipe.base : null,
                            )}
                        >
                            {option.label ?? option.value}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
