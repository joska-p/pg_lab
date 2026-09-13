import * as stylex from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex.ts";
import { typography } from "../theme/consts.stylex.ts";

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
