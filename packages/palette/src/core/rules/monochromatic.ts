import { deriveColor } from '../color';
import type { Color, Rule } from '../types';

const monochromatic = {
    id: 'monochromatic',
    label: 'Monochromatic',
    description: 'Variations of the same hue with different lightness and chroma.',
    apply: (color: Color): Color[] => {
        const lightnessSteps = [0.95, 0.8, 0.65, 0.5, 0.35, 0.2];

        return lightnessSteps.map((l) =>
            deriveColor(color, {
                l,
                // Light and dark ends look more natural with slightly reduced chroma.
                c: l > 0.8 || l < 0.3 ? color.oklch.c * 0.8 : color.oklch.c,
            }),
        );
    },
} as const satisfies Rule;

export { monochromatic };
