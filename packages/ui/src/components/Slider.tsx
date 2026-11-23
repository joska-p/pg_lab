import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { Field, FieldLabel } from '@ui-sdk/react/field';
import {
    Slider as SliderInternal,
    SliderControl,
    SliderIndicator,
    SliderThumb,
    SliderTrack,
    SliderValue,
} from '@ui-sdk/react/slider';
import type { SliderValueChangeDetails } from '@ui-sdk/react/slider';

import { surfaceStyle } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import type { ColorNames } from '../tokens/tint.stylex';
import { tintVars } from '../tokens/tint.stylex';

const RAIL = 6;
const THUMB = 18;

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        width: '100%',
        minWidth: '12rem',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
    control: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: layout.controlTouchTarget,
        touchAction: 'none',
    },
    track: {
        position: 'relative',
        width: '100%',
        height: RAIL,
    },
    indicator: {
        height: '100%',
    },
    thumb: {
        width: THUMB,
        height: THUMB,
        outline: 'none',
        ':focus-within': {
            outline: `3px solid ${tintVars.color}`,
            outlineOffset: 3,
        },
    },
    thumbDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    value: {
        minWidth: space['10'],
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
    },
});

interface SliderProps {
    label: string;
    color?: ColorNames;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number, details: SliderValueChangeDetails) => void;
    disabled?: boolean;
    style?: StyleXStyles;
}

export function Slider({
    label,
    color = 'aurora',
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue = min,
    onValueChange,
    disabled = false,
    style,
}: SliderProps) {
    const trackSurface = surfaceStyle({
        color: 'neutral',
        background: 'solid',
        border: 'none',
        radius: 'full',
    });
    const indicatorSurface = surfaceStyle({
        color,
        background: 'solid',
        border: 'none',
        radius: 'none',
    });
    const thumbSurface = surfaceStyle({
        color,
        background: 'solid',
        border: 'strong',
        radius: 'xs',
        elevation: 'raised',
    });

    return (
        <Field>
            <SliderInternal<number>
                {...stylex.props(styles.root, style)}
                min={min}
                max={max}
                step={step}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <div data-slot="row" {...stylex.props(styles.row)}>
                    <FieldLabel {...stylex.props(fieldText.label)}>{label}</FieldLabel>
                    <SliderValue {...stylex.props(styles.value, fieldText.value)} />
                </div>
                <SliderControl {...stylex.props(styles.control)}>
                    <SliderTrack {...stylex.props(styles.track, trackSurface)}>
                        <SliderIndicator {...stylex.props(styles.indicator, indicatorSurface)} />
                        <SliderThumb
                            className={(state) =>
                                stylex.props(
                                    styles.thumb,
                                    thumbSurface,
                                    state.disabled && styles.thumbDisabled,
                                ).className
                            }
                        />
                    </SliderTrack>
                </SliderControl>
            </SliderInternal>
        </Field>
    );
}
