import type Color from 'colorjs.io';

import type { Rule } from '../types';

/** Base hue plus its neighbors −30° / +30° on the hue wheel. */
const analogous: Rule = {
    apply: (color: Color) => {
        const base = color.clone().to('oklch');

        const colors: Color[] = [];
        const angles = [-30, 0, 30];

        for (const angle of angles) {
            const c = base.clone();

            c.oklch['h'] = ((c.oklch['h'] ?? 0) + angle + 360) % 360;

            const light = c.clone();

            light.oklch['l'] = Math.min(1, (light.oklch['l'] ?? 0) + 0.15);

            colors.push(light);
            colors.push(c);
        }

        return colors;
    },
    info: {
        name: 'Analogous',
        description: 'Colors that are next to each other on the color wheel.',
    },
};

export { analogous };
