import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "../consts/gruvbox-palette.stylex";

// Single source of truth for shadow color (Phase B, S2): every shadow
// token derives from this variable via `color-mix`. An element opts into
// the automatic tint by setting it to its own background color with
// `[shadowColor.color]`. Elements that do not set it keep a neutral
// (black) shadow.
export const shadowColor = stylex.defineVars({
  color: "oklch(0% 0 0)",
});

// The shadow ladder is themeable (vars), so surfaces can re-tint it at the
// token level. Transparent blends are endpoint-identical in any color space,
// but oklab matches the palette's color model (D4).
//
// Depth ladder, alpha-ordered so a cleanliness review holds: rest < raised <
// hover < floating. The alphas carry both modes (a dark surface collapses a
// low-alpha cast shadow into nothing, so they sit a notch above the original
// D1 values); `sunken` composites a top-light line instead of a single
// same-hue inset — a recess needs a lighter inner top edge, not a darker line
// of the very color it hollows out. The ambient pick is `light-dark` (white
// in light, a soft warm `dark4` in dark): a raw white mix read as a hard
// bright line on every well in both modes.
// Calibrated (D-critique P0): re-spaced to 18/30/36/45 so each rung reads
// distinctly on dark surfaces. Rest is subtle; raised lifts; hover deepens;
// floating separates. Sunken inset highlight stays at 88%.
export const shadows = stylex.defineVars({
  rest: `0 1px 2px color-mix(in oklab, ${shadowColor.color} 18%, transparent), 0 1px 1px color-mix(in oklab, ${shadowColor.color} 10%, transparent)`,
  hover: `0 2px 8px color-mix(in oklab, ${shadowColor.color} 36%, transparent)`,
  active: `inset 0 1px 1px color-mix(in oklab, ${shadowColor.color} 18%, transparent)`,
  raised: `0 4px 12px color-mix(in oklab, ${shadowColor.color} 30%, transparent)`,
  floating: `0 8px 28px color-mix(in oklab, ${shadowColor.color} 45%, transparent), 0 2px 8px color-mix(in oklab, ${shadowColor.color} 30%, transparent)`,
  sunken: `inset 0 1px 0 color-mix(in oklab, ${shadowColor.color} 88%, light-dark(white, ${palette.dark4})), inset 0 1px 3px color-mix(in oklab, ${shadowColor.color} 16%, transparent)`,
});
