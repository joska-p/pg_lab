import type { ComponentProps } from 'react';

import type { ColorNames } from '../../tokens/tint.stylex';
import { VisualSvg } from '../core/VisualSvg';
import { generateGlyphBanner } from './generateGlyphBanner';

export interface GlyphBannerVisualProps extends ComponentProps<'svg'> {
    seed?: number | string;
    color?: ColorNames;
    width?: number;
    height?: number;
}

export function GlyphBannerVisual({
    seed = 42,
    color = 'amber',
    width = 320,
    height = 96,
    ...restProps
}: GlyphBannerVisualProps) {
    const graphic = generateGlyphBanner(seed, { width, height });

    return (
        <VisualSvg
            graphic={graphic}
            color={color}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid slice"
            {...restProps}
        />
    );
}
