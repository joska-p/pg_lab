import * as stylex from "@stylexjs/stylex";
import { shadows } from "../tokens/shadows.stylex";

// Elevation model: flat = no cast shadow, border only; raised = tinted
// diffuse cast shadow; sunken = inset (embedded); floating = deepest cast
// (glass compositing lives in `./glass.stylex`). Glow stays orthogonal.
export const elevation = stylex.create({
  flat: {
    boxShadow: "none",
  },

  raised: {
    boxShadow: shadows.raised,
  },

  sunken: {
    boxShadow: shadows.sunken,
  },

  floating: {
    boxShadow: shadows.floating,
  },
});
