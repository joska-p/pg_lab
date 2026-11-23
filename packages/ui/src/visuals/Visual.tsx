import type { ComponentProps } from 'react';

import type { ColorNames } from '../tokens/tint.stylex';
import { generateCardVisual } from './core/registry';
import type { CardStyleId } from './core/types';
import { VisualSvg } from './core/VisualSvg';

export interface VisualProps extends ComponentProps<'svg'> {
    styleVariant?: CardStyleId;
    seed?: number | string;
    color?: ColorNames;
}

export function Visual({
    styleVariant = 'circuit',
    seed = 42,
    color = 'amber',
    ...restProps
}: VisualProps) {
    const visual = generateCardVisual(seed, styleVariant);

    return <VisualSvg graphic={visual.graphic} color={color} {...restProps} />;
}
