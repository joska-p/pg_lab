import * as stylex from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { typography } from "../theme/consts.stylex";

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
