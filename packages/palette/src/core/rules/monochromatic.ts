import type Color from 'colorjs.io';

import type { Rule } from '../types';

const monochromatic: Rule = {
    apply: (color: Color) => {
        const base = color.clone().to('oklch');

        const colors: Color[] = [];
        const lightnessSteps = [0.95, 0.8, 0.65, 0.5, 0.35, 0.2];

        for (const l of lightnessSteps) {
            const c = base.clone();

            c.oklch['l'] = l;

            // Slightly reduce chroma for very light or very dark colors for a more natural look
            if ((l > 0.8 || l < 0.3) && c.oklch['c'] != null) {
                c.oklch['c'] *= 0.8;
            }

            colors.push(c);
        }

        return colors;
    },
    info: {
        name: 'Monochromatic',
        description: 'Variations of the same hue with different lightness and chroma.',
    },
};

export { monochromatic };
