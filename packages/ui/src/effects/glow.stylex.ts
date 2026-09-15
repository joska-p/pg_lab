import * as stylex from "@stylexjs/stylex";
import { fx } from "../consts/effects.stylex";
import { shadowColor } from "../tokens/shadows.stylex";

// Glow family — luminosity as state language (Pilot Light Rule). Applies a
// translucent halo tinted by `currentColor` or by the element's `shadowColor`.
// Orthogonal to elevation: glow communicates active/selected/live, never
// height.
export const glow = stylex.create({
  glow: {
    filter: `drop-shadow(0 0 ${fx.glowBlur} currentColor)`,
  },

  glowSubtle: {
    filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
  },

  glowStrong: {
    filter: `drop-shadow(0 0 ${fx.glowStrongBlur} currentColor)`,
  },

  // Small opaque box-shadow halo tinted by the element's `shadowColor`.
  // On/off widgets apply a `colorIntents[variant]` map first (which sets
  // `[shadowColor.color]` to the family), so the ring follows the family:
  // an effect tinted via the shadow variable — not a raw per-family map.
  glowRing: {
    boxShadow: `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent)`,
  },
});
