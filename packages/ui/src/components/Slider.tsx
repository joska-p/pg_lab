import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import { tintVars } from '../tokens/tint.stylex';
import type { LayoutStyle } from '../types';

// Dimensions locales (px). À remplacer par des tokens `layout.*` si tu les agrandis.
const RAIL = 6;
const THUMB = 18;

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

// Position (0 à 1) → distance depuis la gauche, mesurée au centre du thumb.
// Le thumb reste ainsi entièrement dans le conteneur aux deux extrémités.
const centerAt = (ratio: number) => `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${ratio})`;

const styles = stylex.create({
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },
    rowDisabled: {
        opacity: 0.5,
    },
    container: {
        position: 'relative',
        flex: 1,
        minHeight: layout.controlTouchTarget,
        touchAction: 'pan-y',
    },
    track: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: RAIL,
        overflow: 'hidden',
    },
    // Le fill porte la couleur via sa propre surface solide.
    fill: (ratio: number) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: centerAt(ratio),
    }),
    thumb: {
        position: 'absolute',
        top: '50%',
        width: THUMB,
        height: THUMB,
        pointerEvents: 'none',
        transform: {
            default: 'translate(-50%, -50%) scale(1)',
            [stylex.when.siblingAfter(':hover')]: 'translate(-50%, -50%) scale(1.1)',
            [stylex.when.siblingAfter(':active')]: 'translate(-50%, -50%) scale(0.94)',
        },
        transitionProperty: 'transform',
        transitionDuration: {
            default: '120ms',
            '@media (prefers-reduced-motion: reduce)': '0ms',
        },
        outline: {
            default: 'none',
            [stylex.when.siblingAfter(':focus-visible')]: `3px solid ${tintVars.color}`,
        },
        outlineOffset: 3,
    },
    thumbAt: (ratio: number) => ({
        left: centerAt(ratio),
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
    inputDisabled: {
        cursor: 'not-allowed',
    },
    value: {
        minWidth: space['10'],
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
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
    background = 'soft', // la piste est un voile teinté ; le fill et le thumb sont pleins
    border = 'strong',
    radius = 'full',
    elevation = 'raised', // appliqué au thumb
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
    const ratio = max > min ? (current - min) / (max - min) : 0;

    const trackSurface = surfaceStyles({ color, background, border, radius, elevation: 'flat' });
    const fillSurface = surfaceStyles({
        color,
        background: 'solid',
        border: 'none',
        radius: 'none', // la piste clippe déjà avec overflow: hidden
    });
    const thumbSurface = surfaceStyles({
        color,
        background: 'solid',
        border,
        radius: 'full',
        elevation,
    });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        // Arrondi à la précision du pas pour éviter 0.30000000000000004.
        const next = clamp(Number(Number(event.currentTarget.value).toFixed(precision)), min, max);
        if (!isControlled) {
            setInternal(next);
        }
        onValueChange?.(next);
    }

    return (
        <div {...stylex.props(styles.row, disabled && styles.rowDisabled)}>
            {label && (
                <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
                    {label}
                </label>
            )}

            <div {...stylex.props(styles.container, style)}>
                <div {...stylex.props(trackSurface, styles.track)}>
                    <div {...stylex.props(fillSurface, styles.fill(ratio))} />
                </div>
                <div {...stylex.props(thumbSurface, styles.thumb, styles.thumbAt(ratio))} />

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
                    {...stylex.props(
                        styles.input,
                        disabled && styles.inputDisabled,
                        stylex.defaultMarker(),
                    )}
                />
            </div>

            <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
                {current.toFixed(precision)}
            </output>
        </div>
    );
}
