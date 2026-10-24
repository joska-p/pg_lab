import type Color from 'colorjs.io';

import type { Rule } from '../types';

/** Three colors 120° apart around the hue wheel. */
const triadic: Rule = {
    apply: (color: Color) => {
        const base = color.clone().to('oklch');

        const colors: Color[] = [];
        const angles = [0, 120, 240];

        for (const angle of angles) {
            const c = base.clone();

            if (c.oklch['h'] != null) {
                c.oklch['h'] = (c.oklch['h'] + angle) % 360;
            }

            const variation = c.clone();

            if (variation.oklch['l'] != null) {
                variation.oklch['l'] =
                    variation.oklch['l'] > 0.5
                        ? variation.oklch['l'] - 0.2
                        : variation.oklch['l'] + 0.2;
            }

            colors.push(c);
            colors.push(variation);
        }

        return colors;
    },
    info: {
        name: 'Triadic',
        description: 'Three colors evenly spaced around the color wheel.',
    },
};

export { triadic };
