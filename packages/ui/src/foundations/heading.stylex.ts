import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { typography } from "../consts/typography.stylex";

// The heading ladder (Upper-Label Rule: everything uppercase, wide tracking).
// Level is carried by size, weight, face and tone, so the step reads at a
// glance:
//   level1 — page/content section (SectionHeading)  · sans 600, largest
//   level2 — panel title (ControlPanel)             · sans 500
//   level3 — control-group label (ControlSection)   · mono 500, muted
// Level 3 turns mono because it is a technical mod label (a reading), per the
// two-face contract: sans does UI work, mono names instruments.
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
