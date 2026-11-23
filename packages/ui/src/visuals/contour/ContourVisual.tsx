import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateContour } from './generateContour';

export interface ContourVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function ContourVisual({ seed = 42, color = 'amber', ...restProps }: ContourVisualProps) {
    const graphic = generateContour(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
