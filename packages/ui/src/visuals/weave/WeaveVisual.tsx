import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateWeave } from './generateWeave';

export interface WeaveVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function WeaveVisual({ seed = 42, color = 'amber', ...restProps }: WeaveVisualProps) {
    const graphic = generateWeave(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
