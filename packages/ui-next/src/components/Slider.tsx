import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { interactionStyles } from '../recipes/interactions';
import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function decimals(step: number) {
    if (Number.isInteger(step)) {
        return 0;
    }
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
    },
    track: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: layout.sliderRailHeight,
        overflow: 'hidden',
    },
    // `currentColor` = la couleur définie par surfaceStyles sur la piste.
    fill: (progress: string) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: progress,
        backgroundColor: 'currentColor',
    }),
    thumb: {
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: layout.sliderThumbSize,
        height: layout.sliderThumbSize,
        pointerEvents: 'none',
        // Anneau de focus piloté par l'input frère placé après le thumb.
        outline: {
            default: 'none',
            [stylex.when.siblingAfter(':focus-visible')]: '2px solid currentColor',
        },
        outlineOffset: '2px',
    },
    thumbAt: (progress: string) => ({
        left: progress,
    }),
    input: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        opacity: 0,
        cursor: 'pointer',
    },
    value: {
        minWidth: space['10'],
        textAlign: 'right',
    },
});

interface SliderProps
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
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    style?: LayoutStyle;
}

export function Slider({
    label,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'full',
    elevation = 'flat',
    min,
    max,
    step = 1,
    value,
    defaultValue = min,
    onValueChange,
    disabled = false,
    id: idProp,
    style,
    ...props
}: SliderProps) {
    const id = useId();
    const controlId = idProp ?? id;
    const [internal, setInternal] = useState(defaultValue);
    const isControlled = value !== undefined;
    const current = clamp(isControlled ? value : internal, min, max);
    const precision = decimals(step);
    const progress = `${((current - min) / (max - min)) * 100}%`;
    const surface = surfaceStyles({ color, background, border, radius, elevation });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const next = clamp(Number(event.currentTarget.value), min, max);
        if (!isControlled) {
            setInternal(next);
        }
        onValueChange?.(next);
    }

    return (
        <div {...stylex.props(styles.row)}>
            {label ? (
                <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
                    {label}
                </label>
            ) : null}

            <div {...stylex.props(styles.container, interactionStyles({ disabled }), style)}>
                <div {...stylex.props(surface, styles.track)}>
                    <div {...stylex.props(styles.fill(progress))} />
                </div>
                <div {...stylex.props(surface, styles.thumb, styles.thumbAt(progress))} />

                <input
                    {...props}
                    id={controlId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={current}
                    onChange={handleChange}
                    disabled={disabled}
                    {...stylex.props(styles.input, stylex.defaultMarker())}
                />
            </div>

            <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
                {current.toFixed(precision)}
            </output>
        </div>
    );
}
