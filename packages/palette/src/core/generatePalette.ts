import type { Color, Palette, Rule } from './types';

function generatePalette(baseColor: Color, rule: Rule): Palette {
    return {
        colors: rule.apply(baseColor),
    };
}

export { generatePalette };
