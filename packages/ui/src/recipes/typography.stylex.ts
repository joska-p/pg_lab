import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { families } from "../tokens/families.stylex";
import { typography } from "../tokens/typography.stylex";

export const heading = stylex.create({
  level1: {
    margin: 0,
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
    color: colors.foreground,
  },
  level2: {
    margin: 0,
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
    color: colors.foreground,
  },
  level3: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
    color: colors.mutedForeground,
  },
});

export const fieldText = stylex.create({
  label: {
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: typography.letterSpacingTight,
    color: colors.mutedForeground,
  },
  value: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    color: colors.foreground,
  },
  message: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: families.error.base,
  },
});
