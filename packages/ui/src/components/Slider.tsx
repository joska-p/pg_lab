import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { disabled as disabledRecipe } from '../recipes/interaction.stylex';
import { fieldText } from '../recipes/typography.stylex';
import { colors } from '../tokens/colors.stylex';
import { families, type FamilyName } from '../tokens/families.stylex';
import { borderWidth, interaction, layout, radius, space } from '../tokens/layout.stylex';
import { shadowColor, shadows } from '../tokens/shadows.stylex';

type SliderProps = {
    label?: string;
    family?: FamilyName;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    disabled?: boolean;
    id?: string;
    style?: StyleXStyles;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function decimals(step: number) {
    if (Number.isInteger(step)) return 0;
    return (
        step
            .toFixed(10)
            .replace(/\.?0+$/, '')
            .split('.')[1]?.length ?? 0
    );
}

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },

    container: {
        position: 'relative',
        flex: 1,
        minHeight: layout.controlTouchTarget,
        borderRadius: radius.full,
        boxShadow: {
            default: null,
            [stylex.when.descendant(':focus-visible')]:
                `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },

    track: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: layout.sliderRailHeight,
        borderRadius: radius.full,
        backgroundColor: colors.muted,
        [shadowColor.color]: colors.muted,
        boxShadow: shadows.sunken,
    },

    fill: (progress: string, color: string) => ({
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: progress,
        height: layout.sliderRailHeight,
        borderRadius: radius.full,
        backgroundColor: color,
    }),

    thumb: (progress: string, mark: string) => ({
        position: 'absolute',
        left: progress,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: layout.sliderThumbSize,
        height: layout.sliderThumbSize,
        borderRadius: radius.full,
        backgroundColor: colors.background,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: mark,
        [shadowColor.color]: mark,
        boxShadow: shadows.rest,
    }),

    input: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        opacity: 0,
        cursor: interaction.cursorPointer,
    },

    value: {
        minWidth: space['10'],
        textAlign: 'right',
    },
});

export function Slider(props: SliderProps) {
    const {
        label,
        family = 'aurora',
        min,
        max,
        step = 1,
        value,
        defaultValue = min,
        onValueChange,
        disabled,
        id: idProp,
        style,
    } = props;

    const id = useId();
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultValue);
    const isControlled = value !== undefined;
    const current = clamp(isControlled ? value : internal, min, max);
    const precision = decimals(step);
    const progress = `${((current - min) / (max - min)) * 100}%`;
    const fam = families[family];

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const next = clamp(Number(event.currentTarget.value), min, max);
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
    }

    return (
        <div {...stylex.props(styles.row)}>
            {label ? (
                <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
                    {label}
                </label>
            ) : null}

            <div {...stylex.props(styles.container, disabled ? disabledRecipe.base : null, style)}>
                <div {...stylex.props(styles.track)} />
                <div {...stylex.props(styles.fill(progress, fam.base))} />
                <div {...stylex.props(styles.thumb(progress, fam.strong))} />

                <input
                    id={controlId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={current}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-label={label}
                    {...stylex.props(styles.input, stylex.defaultMarker())}
                />
            </div>

            <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
                {current.toFixed(precision)}
            </output>
        </div>
    );
}
