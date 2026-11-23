import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateConstellation } from './generateConstellation';

export interface ConstellationVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function ConstellationVisual({
    seed = 42,
    color = 'amber',
    ...restProps
}: ConstellationVisualProps) {
    const graphic = generateConstellation(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
