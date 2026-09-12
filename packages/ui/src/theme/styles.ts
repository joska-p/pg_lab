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
    color: color.accentActive,
  },
  selected: {
    backgroundColor: color.accent,
    borderColor: color.accentActive,
    color: color.onAccent,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.45,
  },
  focusRing: {
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 1px ${color.accent}, 0 0 0 3px color-mix(in srgb, ${color.accent} 25%, transparent)`,
    },
  },
});
