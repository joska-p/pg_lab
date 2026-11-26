import { deriveColor, rotateHue } from '../color';
import type { Color, Rule } from '../types';

/** Three colors 120° apart around the hue wheel. */
const triadic = {
    id: 'triadic',
    label: 'Triadic',
    description: 'Three colors evenly spaced around the hue wheel.',
    apply: (color: Color): Color[] => {
        const colors: Color[] = [];
        const angles = [0, 120, 240];

        for (const angle of angles) {
            const c = rotateHue(color, angle);

            const variation = deriveColor(c, {
                l: c.oklch.l > 0.5 ? c.oklch.l - 0.2 : c.oklch.l + 0.2,
            });

            colors.push(c, variation);
        }

        return colors;
    },
} as const satisfies Rule;

export { triadic };
