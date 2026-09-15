import * as stylex from "@stylexjs/stylex";
import { shadows } from "../tokens/shadows.stylex";
import { colors } from "../tokens/colors.stylex";

// Press intent: rest → hover → active, plus an explicit `:focus-visible` that
// COMPOSES the keyboard ring onto the rest cast (box-shadow is a list), so
// focus no longer replaces the lift — the old focusRing-then-pressable merge
// dropped the resting elevation exactly while keyboard-focused.
export const pressable = stylex.create({
  base: {
    boxShadow: {
      default: shadows.rest,
      ":hover": shadows.hover,
      ":active": shadows.active,
      ":focus-visible": `${shadows.rest}, 0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },
});
