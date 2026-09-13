import * as stylex from "@stylexjs/stylex";

import { motion } from "../theme/consts.stylex.ts";
import { colors, typography } from "../theme/tokens.stylex.ts";

export const primitives = stylex.create({
  interactive: {
    cursor: "pointer",
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "background-color, border-color, color, box-shadow, opacity, transform",
  },

  active: {
    borderColor: colors.ring,
    color: colors.primary,
  },

  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.primaryForeground,
  },

  disabled: {
    cursor: "not-allowed",
    opacity: 0.45,
  },

  focusRing: {
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },

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
