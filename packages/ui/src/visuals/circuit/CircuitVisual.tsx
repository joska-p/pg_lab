import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateCircuit } from './generateCircuit';

export interface CircuitVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function CircuitVisual({ seed = 42, color = 'amber', ...restProps }: CircuitVisualProps) {
    const graphic = generateCircuit(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
