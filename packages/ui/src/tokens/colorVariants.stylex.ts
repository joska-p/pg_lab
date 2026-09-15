import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "../consts/gruvbox-palette.stylex";
import { colors } from "./colors.stylex";

// Semantic color-variant slots. Every family exposes the SAME role set —
// flattened for the stable `defineVars` API, with a uniform suffix:
//
//   <family>Bg       — base fill        (canonical surface, shadow-tint source)
//   <family>BgHover  — hover fill
//   <family>BgActive — pressed fill     (reserved: active feedback is currently
//                      an inset shadow + press scale, no component consumes it)
//   <family>Fg       — foreground on bg
//   <family>Border   — outline          (equals `Bg` for the colored families)
//   <family>Ring     — focus identity   (fields use the family ring; the
//                      universal keyboard halo on buttons stays `colors.ring`)
//
// Consumers pick only the roles they need — a Badge may use `Border` + `Fg`,
// a Button `Bg` + `BgHover` + `Fg` + `Border`, a text field `Border` + `Ring`.
// The `muted` family signals through its `Fg` (Muted Ink) where contrast
// demands it — Slider fill, Radio dot, Badge, Segmented chosen, and check
// marks express the neutral variant via `Fg`, documented per widget.
export const colorVariants = stylex.defineVars({
  primaryBg: colors.primary,
  primaryBgHover: colors.primaryHover,
  primaryBgActive: `light-dark(color-mix(in oklab, ${palette.brightBlue} 88%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.fadedBlue} 94%, ${palette.dark0Hard}))`,
  primaryFg: colors.primaryForeground,
  primaryBorder: colors.primary,
  primaryRing: colors.ring,

  secondaryBg: colors.secondary,
  secondaryBgHover: colors.secondaryHover,
  secondaryBgActive: `light-dark(color-mix(in oklab, ${palette.brightGreen} 88%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.fadedGreen} 94%, ${palette.dark0Hard}))`,
  secondaryFg: colors.secondaryForeground,
  secondaryBorder: colors.secondary,
  secondaryRing: colors.secondary,

  accentBg: colors.accent,
  accentBgHover: colors.accentHover,
  accentBgActive: `light-dark(color-mix(in oklab, ${palette.brightPurple} 88%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.fadedPurple} 94%, ${palette.dark0Hard}))`,
  accentFg: colors.accentForeground,
  accentBorder: colors.accent,
  accentRing: colors.accent,

  warningBg: colors.warning,
  warningBgHover: colors.warningHover,
  warningBgActive: `light-dark(color-mix(in oklab, ${palette.brightYellow} 88%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.fadedYellow} 94%, ${palette.dark0Hard}))`,
  warningFg: colors.warningForeground,
  warningBorder: colors.warning,
  warningRing: colors.warning,

  destructiveBg: colors.destructive,
  destructiveBgHover: colors.destructiveHover,
  destructiveBgActive: `light-dark(color-mix(in oklab, ${palette.brightRed} 88%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.fadedRed} 94%, ${palette.dark0Hard}))`,
  destructiveFg: colors.destructiveForeground,
  destructiveBorder: colors.destructive,
  destructiveRing: colors.destructive,

  mutedBg: colors.muted,
  mutedBgHover: colors.mutedHover,
  mutedBgActive: `light-dark(color-mix(in oklab, ${palette.light3} 92%, ${palette.dark0Hard}), color-mix(in oklab, ${palette.dark2} 55%, ${palette.dark0Hard}))`,
  mutedFg: colors.mutedForeground,
  mutedBorder: colors.muted,
  mutedRing: colors.mutedForeground,
});
