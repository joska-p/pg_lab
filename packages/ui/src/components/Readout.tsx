import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['3'],
        paddingBlock: space['1'],
        paddingInline: space['3'],
    },
});

interface ReadoutProps extends SurfaceProps {
    label: string;
    value?: React.ReactNode;
    style?: LayoutStyle;
}

export function Readout({
    label,
    value,
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    style,
}: ReadoutProps) {
    const labelId = useId();

    return (
        <div
            {...stylex.props(
                styles.base,
                surfaceStyles({ color, background, border, radius, elevation }),
                style,
            )}
        >
            <span id={labelId} {...stylex.props(fieldText.label)}>
                {label}
            </span>
            <span aria-live="polite" aria-labelledby={labelId} {...stylex.props(fieldText.value)}>
                {value}
            </span>
        </div>
    );
}
