import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex.ts";
import { motion } from "./consts.stylex.ts";

export const styles = stylex.create({
  interactive: {
    cursor: "pointer",
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "background-color, border-color, color, box-shadow, opacity",
  },

  active: {
    borderColor: color.borderActive,
    color: color.primary,
  },

  selected: {
    backgroundColor: color.primaryBackground,
    borderColor: color.primary,
    color: color.primary,
  },

  disabled: {
    cursor: "not-allowed",
    opacity: 0.45,
  },

  focusRing: {
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 2px ${color.background}, 0 0 0 3px ${color.primary}`,
    },
  },
});
