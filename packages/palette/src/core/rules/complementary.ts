import type Color from 'colorjs.io';

import type { Rule } from '../types';

/** Base + its 180°-opposite hue, each with light/dark variants so the palette isn't just two colors. */
const complementary: Rule = {
    apply: (color: Color) => {
        const base = color.clone().to('oklch');
        const complement = base.clone();

        complement.oklch['h'] = ((complement.oklch['h'] ?? 0) + 180) % 360;

        // Generate variations: [base-light, base, base-dark, comp-light, comp, comp-dark]
        const baseLight = base.clone();

        baseLight.oklch['l'] = Math.min(1, (baseLight.oklch['l'] ?? 0) + 0.2);

        const baseDark = base.clone();

        baseDark.oklch['l'] = Math.max(0, (base.oklch['l'] ?? 0) - 0.2);

        const compLight = complement.clone();

        compLight.oklch['l'] = Math.min(1, (complement.oklch['l'] ?? 0) + 0.2);

        const compDark = complement.clone();

        compDark.oklch['l'] = Math.max(0, (complement.oklch['l'] ?? 0) - 0.2);

        return [baseLight, base, baseDark, compLight, complement, compDark];
    },
    info: {
        name: 'Complementary',
        description: 'The base color and its opposite on the hue wheel, with lightness variations.',
    },
};

export { complementary };
