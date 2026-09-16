import * as stylex from "@stylexjs/stylex";
import { motion } from "../consts/motion.stylex";
import { interaction } from "../consts/interaction.stylex";

// Base interactive behavior (state-free): cursor + transition config for any
// pressable element. State styles (focus, disabled, hover, press) live in
// `intents/*`.
export const interactiveBase = stylex.create({
  base: {
    cursor: interaction.cursorPointer,
    transitionDuration: {
      default: motion.durationFast,
      "@media (prefers-reduced-motion: reduce)": "1ms",
    },
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "background-color, border-color, color, box-shadow, opacity, transform",
  },
});
