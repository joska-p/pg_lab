import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./gruvbox-palette.stylex";

// Dual-mode tokens via light-dark() (StyleX light-dark recipe): first value
// is light, second is dark. The used scheme comes from the `color-scheme`
// property — apps set `light`, `dark`, or `light dark` (system, follows the
// OS live with no JS). Hover shades use one neutral value valid in both.
//
// Palette is canonical (gruvbox, never edited). Where a pair falls under WCAG
// 4.5:1, the token is DERIVED by mixing the palette value in OKLab (D4):
// toward black/white for text, toward `background` for elevated dark
// surfaces. Hue stays gruvbox; only lightness moves.
export const colors = stylex.defineVars({
  background: `light-dark(${palette.light1}, ${palette.dark0})`,

  // Reading text (D4): `dark0` on `light1` = 4.40:1, just under AA. A 20%
  // pull toward black lands the light pairs at ~4.7–5.9:1; dark uses
  // `light0Hard` (~4.8:1 on `background`). Palette untouched.
  foreground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  // Elevated dark surfaces (D4): deepened toward `background` so light text
  // climbs from ~3.3 to ~4.1:1 while the dark ladder (background → card →
  // floating) stays readable. A stricter pass would need to flatten the
  // ladder onto `dark0` — structurally rejected, documented.
  card: `light-dark(${palette.light0}, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}))`,

  cardForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  popover: `light-dark(${palette.light0}, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}))`,

  popoverForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  primary: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,

  // Non-warning families share one derived foreground (D4): light pulled
  // toward black is ~4.2–4.8:1 on the bright bases; dark `light0Hard` is the
  // best a `faded*` base can carry (~2–2.7:1, documented shortfall).
  primaryForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  // The neutral shade works as hover in both modes:
  // its lightness sits between bright (light mode bg) and faded (dark mode bg).
  primaryHover: palette.neutralBlue,

  secondary: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,

  secondaryForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  secondaryHover: palette.neutralGreen,

  // Neutral family (S8): the base covers non-editable surfaces (tracks,
  // group wells, muted fills); the signal goes through mutedForeground.
  // Per-widget expression differs by contrast necessity — documented in
  // component-authoring.md § Colors.
  muted: `light-dark(${palette.light3}, color-mix(in oklab, ${palette.dark2} 60%, ${palette.dark0}))`,

  // Muted text (D4): light was unreadable (dark3, ~2.2:1) — pulled toward
  // dark0Hard it reads at ~4.6–5.0:1 while staying softer than body. Dark
  // lightens to `light3` (labels ~3.6:1 on background, tracked as a
  // shortfall). No neutral equivalent, so each mode names its value.
  mutedForeground: `light-dark(color-mix(in oklab, ${palette.dark0Hard} 85%, ${palette.dark2}), ${palette.light3})`,

  // No neutral equivalent, so each mode names its value explicitly.
  mutedHover: `light-dark(${palette.light4}, ${palette.dark3})`,

  accent: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,

  accentForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  accentHover: palette.neutralPurple,

  destructive: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,

  destructiveForeground: `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`,

  destructiveHover: palette.neutralRed,

  warning: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,

  // Warning keeps its canonical foreground: dark0Hard on the bright yellow
  // already passes in light (4.62:1). Its dark pair stays a shortfall.
  warningForeground: `light-dark(${palette.dark0Hard}, ${palette.light1})`,

  warningHover: palette.neutralYellow,

  // Quiet by default (D1): a translucent mix so borders recede instead of
  // drawing hard rectangles. Hover/focus states brighten locally per
  // component (see DESIGN.md: barely visible → visible → luminous).
  // Decorative: non-text contrast is a documented shortfall. Dark was
  // quieted one step (dark3 55% → dark2 50%, D-critique): the lighter
  // dark3 line read as a bright outline on the dark card ground.
  // Mixed in oklab (D4) — a transparent blend is endpoint-identical in any
  // space, but oklab matches the palette's color model.
  // Calibrated (D-critique P0): raised to ~75%/70% so borders read as
  // deliberate depth cues (~1.4–1.6:1 vs card/page) not invisible seams.
  border: `light-dark(color-mix(in oklab, ${palette.light3} 75%, transparent), color-mix(in oklab, ${palette.dark2} 70%, transparent))`,

  // Editable wells (text fields, selects, multiline inputs). A distinct
  // role from muted surfaces even where values converge in dark mode:
  // wells are always bordered recesses, muted tracks/groups are not.
  // Dark deepened toward background (D4) so input text lands ~3.8:1.
  input: `light-dark(${palette.light2}, color-mix(in oklab, ${palette.dark2} 35%, ${palette.dark0}))`,

  // Focus ring (S5): intentionally mirrors primary — keyboard focus carries
  // primary identity. If the primary hue ever changes, update both together.
  ring: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
});
