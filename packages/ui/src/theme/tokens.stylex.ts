import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./gruvbox-palette.stylex";

// Dual-mode tokens via light-dark() (StyleX light-dark recipe): first value
// is light, second is dark. The used scheme comes from the `color-scheme`
// property — apps set `light`, `dark`, or `light dark` (system, follows the
// OS live with no JS). Hover shades use one neutral value valid in both.
export const colors = stylex.defineVars({
  background: `light-dark(${palette.light1}, ${palette.dark0})`,

  foreground: `light-dark(${palette.dark0}, ${palette.light1})`,

  card: `light-dark(${palette.light0}, ${palette.dark1})`,

  cardForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  popover: `light-dark(${palette.light0}, ${palette.dark1})`,

  popoverForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  primary: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,

  primaryForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  // The neutral shade works as hover in both modes:
  // its lightness sits between bright (light mode bg) and faded (dark mode bg).
  primaryHover: palette.neutralBlue,

  secondary: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,

  secondaryForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  secondaryHover: palette.neutralGreen,

  // Neutral family (S8): the base covers non-editable surfaces (tracks,
  // group wells, muted fills); the signal goes through mutedForeground.
  // Per-widget expression differs by contrast necessity — documented in
  // component-authoring.md § Colors.
  muted: `light-dark(${palette.light3}, ${palette.dark2})`,

  mutedForeground: `light-dark(${palette.dark3}, ${palette.light4})`,

  // No neutral equivalent, so each mode names its value explicitly.
  mutedHover: `light-dark(${palette.light4}, ${palette.dark3})`,

  accent: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,

  accentForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  accentHover: palette.neutralPurple,

  destructive: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,

  destructiveForeground: `light-dark(${palette.dark0}, ${palette.light1})`,

  destructiveHover: palette.neutralRed,

  warning: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,

  warningForeground: `light-dark(${palette.dark0Hard}, ${palette.light1})`,

  warningHover: palette.neutralYellow,

  // Quiet by default (D1): a translucent mix so borders recede instead of
  // drawing hard rectangles. Hover/focus states brighten locally per
  // component (see README Borders: barely visible → visible → luminous).
  border: `light-dark(color-mix(in srgb, ${palette.light3} 55%, transparent), color-mix(in srgb, ${palette.dark3} 55%, transparent))`,

  // Editable wells (text fields, selects, multiline inputs). A distinct
  // role from muted surfaces even where values converge in dark mode:
  // wells are always bordered recesses, muted tracks/groups are not.
  input: `light-dark(${palette.light2}, ${palette.dark2})`,

  // Focus ring (S5): intentionally mirrors primary — keyboard focus carries
  // primary identity. If the primary hue ever changes, update both together.
  ring: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
});
