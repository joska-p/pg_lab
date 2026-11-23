import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateSpectrum } from './generateSpectrum';

export interface SpectrumVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function SpectrumVisual({ seed = 42, color = 'amber', ...restProps }: SpectrumVisualProps) {
    const graphic = generateSpectrum(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
