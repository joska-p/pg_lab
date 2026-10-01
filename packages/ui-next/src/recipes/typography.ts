import * as stylex from '@stylexjs/stylex';

import { typography } from '../tokens/const.stylex';
import { surface } from '../tokens/surface.stylex';
import { colors } from '../tokens/tint.stylex';

export const heading = stylex.create({
    level1: {
        margin: 0,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeLg,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.foreground,
    },
    level2: {
        margin: 0,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.foreground,
    },
    level3: {
        margin: 0,
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.foreground,
    },
});

export const fieldText = stylex.create({
    label: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingTight,
        color: surface.foreground,
    },
    value: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeSm,
        color: surface.foreground,
    },
    message: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        color: colors.orange,
    },
});
