import { deriveColor, rotateHue } from '../color';
import type { Color, Rule } from '../types';

/** Base hue plus its neighbors −30° / +30° on the hue wheel. */
const analogous = {
    id: 'analogous',
    label: 'Analogous',
    description: 'Colors that are next to each other on the color wheel.',
    apply: (color: Color): Color[] => {
        const colors: Color[] = [];
        const angles = [-30, 0, 30];

        for (const angle of angles) {
            const c = rotateHue(color, angle);

            colors.push(deriveColor(c, { l: Math.min(1, c.oklch.l + 0.15) }), c);
        }

        return colors;
    },
} as const satisfies Rule;

export { analogous };
