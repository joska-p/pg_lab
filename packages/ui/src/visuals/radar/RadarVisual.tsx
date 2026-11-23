import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateRadar } from './generateRadar';

export interface RadarVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function RadarVisual({ seed = 42, color = 'amber', ...restProps }: RadarVisualProps) {
    const graphic = generateRadar(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
