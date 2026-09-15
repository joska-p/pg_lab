import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { typography } from "../consts/typography.stylex";

// Base field typography (state-free): the label and instrument value shared
// by every widget row. No interaction or state logic here.
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
});
