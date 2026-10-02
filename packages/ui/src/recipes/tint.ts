import * as stylex from '@stylexjs/stylex';

import { colors, onColors, tintVars } from '../tokens/tint.stylex';

// Une entrée par couleur : écrit la teinte ET son texte lisible. Les deux sont
// toujours posés ensemble, sinon une surface imbriquée hériterait du `onColor`
// de son parent.
export const tint = stylex.create({
    neutral: {
        [tintVars.color]: colors.neutral,
        [tintVars.onColor]: onColors.neutral,
    },
    aurora: {
        [tintVars.color]: colors.aurora,
        [tintVars.onColor]: onColors.aurora,
    },
    solder: {
        [tintVars.color]: colors.solder,
        [tintVars.onColor]: onColors.solder,
    },
    purple: {
        [tintVars.color]: colors.purple,
        [tintVars.onColor]: onColors.purple,
    },
    amber: {
        [tintVars.color]: colors.amber,
        [tintVars.onColor]: onColors.amber,
    },
    error: {
        [tintVars.color]: colors.error,
        [tintVars.onColor]: onColors.error,
    },
    aqua: {
        [tintVars.color]: colors.aqua,
        [tintVars.onColor]: onColors.aqua,
    },
    orange: {
        [tintVars.color]: colors.orange,
        [tintVars.onColor]: onColors.orange,
    },
});

export const colorText = stylex.create({
    neutral: { color: colors.neutral },
    aurora: { color: colors.aurora },
    solder: { color: colors.solder },
    purple: { color: colors.purple },
    amber: { color: colors.amber },
    error: { color: colors.error },
    aqua: { color: colors.aqua },
    orange: { color: colors.orange },
});
