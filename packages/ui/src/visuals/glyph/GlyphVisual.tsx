import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateGlyph } from './generateGlyph';

export interface GlyphVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
}

export function GlyphVisual({ seed = 142, color = 'amber', ...restProps }: GlyphVisualProps) {
    const graphic = generateGlyph(seed);

    return <VisualSvg graphic={graphic} color={color} {...restProps} />;
}
