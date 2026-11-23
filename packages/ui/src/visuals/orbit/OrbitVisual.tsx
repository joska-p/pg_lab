import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateOrbit } from './generateOrbit';

export interface OrbitVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function OrbitVisual({ seed = 42, color = 'amber', ...restProps }: OrbitVisualProps) {
    const graphic = generateOrbit(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
