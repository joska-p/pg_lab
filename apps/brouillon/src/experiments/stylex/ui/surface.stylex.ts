import * as stylex from '@stylexjs/stylex';

import { palette } from './const.stylex';

// Neutres de page (à poser sur body/root) : fond et texte par défaut, indépendants
// de toute teinte. Les surfaces teintées, elles, passent par tintVars.
export const surface = stylex.defineVars({
    background: `light-dark(${palette.light0}, ${palette.dark0})`,
    foreground: `light-dark(${palette.dark0}, ${palette.light0})`,
});
