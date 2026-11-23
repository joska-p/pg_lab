import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateLattice } from './generateLattice';

export interface LatticeVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function LatticeVisual({ seed = 42, color = 'amber', ...restProps }: LatticeVisualProps) {
    const graphic = generateLattice(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
