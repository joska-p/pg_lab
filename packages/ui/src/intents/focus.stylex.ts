import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";

// Focus intent — the universal keyboard halo: 2px of ground behind 3px of
// ring. Applies to pressables (buttons, toggles, checkboxes, segmented,
// radios, color swatches). The halo carries `colors.ring`, which mirrors the
// primary hue: keyboard focus keeps primary identity regardless of variant.
export const focusRing = stylex.create({
  base: {
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },
});
