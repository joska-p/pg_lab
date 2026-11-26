import { deriveColor, rotateHue } from '../color';
import type { Color, Rule } from '../types';

/** Base + its 180°-opposite hue, each with light/dark variants so the palette isn't just two colors. */
const complementary = {
    id: 'complementary',
    label: 'Complementary',
    description: 'The base color and its opposite on the hue wheel, with lightness variations.',

    apply: (color: Color): Color[] => {
        const complement = rotateHue(color, 180);

        const light = (source: Color): Color =>
            deriveColor(source, { l: Math.min(1, source.oklch.l + 0.2) });

        const dark = (source: Color): Color =>
            deriveColor(source, { l: Math.max(0, source.oklch.l - 0.2) });

        // Generate variations: [base-light, base, base-dark, comp-light, comp, comp-dark]
        return [light(color), color, dark(color), light(complement), complement, dark(complement)];
    },
} as const satisfies Rule;

export { complementary };
