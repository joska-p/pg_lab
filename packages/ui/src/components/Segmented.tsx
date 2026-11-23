import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import type { ChangeDetails } from '@ui-sdk/core';
import { Field, FieldLabel } from '@ui-sdk/react/field';
import {
    SegmentedControl,
    SegmentedControlIndicator,
    SegmentedControlItem,
} from '@ui-sdk/react/segmented-control';
import type { SegmentedControlValueChangeReason } from '@ui-sdk/react/segmented-control';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyle } from '../recipes/surface';
import type { SurfaceStyleProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import { tintVars } from '../tokens/tint.stylex';

interface SegmentOption<T extends string> {
    value: T;
    label?: string;
}

type SegmentedValueChangeDetails = ChangeDetails<SegmentedControlValueChangeReason>;

interface SegmentedProps<T extends string> extends SurfaceStyleProps {
    label?: string;
    options: readonly T[] | readonly SegmentOption<T>[];
    value?: T;
    onValueChange?: (value: T, details: SegmentedValueChangeDetails) => void;
    disabled?: boolean;
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
        position: 'relative',
        display: 'inline-flex',
        isolation: 'isolate',
        flexWrap: 'wrap',
        gap: space['1'],
        padding: space['1'],
        backgroundColor: 'transparent',
    },
    indicator: {
        position: 'absolute',
        top: 'var(--segmented-control-indicator-top)',
        left: 'var(--segmented-control-indicator-left)',
        width: 'var(--segmented-control-indicator-width)',
        height: 'var(--segmented-control-indicator-height)',
        transitionProperty: 'top, left, width, height',
        transitionDuration: '200ms',
    },
    indicatorInitial: {
        transitionDuration: '0ms',
    },
    option: {
        position: 'relative',
        zIndex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: layout.controlTouchTarget,
        paddingBlock: space['2'],
        paddingInline: space['3'],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
    },
    checked: {
        color: tintVars.onColor,
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
    onValueChange,
    disabled = false,
    style,
}: SegmentedProps<T>) {
    const items: SegmentOption<T>[] = (options as readonly (T | SegmentOption<T>)[]).map((option) =>
        typeof option === 'string' ? { value: option } : option,
    );
    const firstValue = items[0]?.value ?? null;
    const surface = surfaceStyle({ color, background, border, radius, elevation });

    return (
        <Field>
            <div {...stylex.props(styles.row)}>
                {label ? <FieldLabel {...stylex.props(fieldText.label)}>{label}</FieldLabel> : null}

                <SegmentedControl<T>
                    {...stylex.props(surface, styles.group, style)}
                    value={value}
                    defaultValue={value === undefined ? firstValue : undefined}
                    onValueChange={(next, details) => {
                        if (next !== null) {
                            onValueChange?.(next, details);
                        }
                    }}
                    disabled={disabled}
                    aria-label={label ? undefined : 'selection'}
                >
                    <SegmentedControlIndicator
                        className={(state) =>
                            stylex.props(
                                surface,
                                styles.indicator,
                                state.direction === 'none' && styles.indicatorInitial,
                            ).className
                        }
                    />
                    {items.map((option) => (
                        <SegmentedControlItem
                            key={option.value}
                            value={option.value}
                            className={(state) =>
                                stylex.props(
                                    styles.option,
                                    fieldText.value,
                                    state.checked && styles.checked,
                                    interactionStyles({ disabled: state.disabled }),
                                ).className
                            }
                        >
                            {option.label ?? option.value}
                        </SegmentedControlItem>
                    ))}
                </SegmentedControl>
            </div>
        </Field>
    );
}
