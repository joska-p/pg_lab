import * as stylex from "@stylexjs/stylex";
import { motion } from "../theme/consts.stylex.ts";
import { colors } from "../theme/tokens.stylex.ts";

export const interactive = stylex.create({
  base: {
    cursor: "pointer",
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "background-color, border-color, color, box-shadow, opacity, transform",
  },

  focusRing: {
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },

  disabled: {
    cursor: "not-allowed",
    opacity: 0.45,
  },
});
