import * as stylex from "@stylexjs/stylex";
import { fx } from "../consts/effects.stylex";
import { shadowColor, shadows } from "../tokens/shadows.stylex";
import { colors } from "../tokens/colors.stylex";

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

  // Composed Pilot Light key for on/off widgets (S5): halo + the press
  // elevation ladder + focus ring folded into ONE box-shadow value per state,
  // the S2 idiom — StyleX dedupes box-shadow by registration order, so an
  // effect that coexists with press must be a single list. The widget sets
  // `[shadowColor.color]` to the family base, so halo and cast agree with the
  // fill (Shadow-Paints-Itself on a live key).
  glowWithPress: {
    boxShadow: {
      default: `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.rest}`,
      ":hover": `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.hover}`,
      ":active": `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.active}`,
      ":focus-visible": `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.rest}, 0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },
});
