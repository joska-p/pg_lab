import * as stylex from "@stylexjs/stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";

// State-free family surfaces (primary | secondary | accent | warning |
// destructive | muted). These are the shared variant maps: each carries only
// the base surface built from the variant SLOTS — `[shadowColor.color]`
// (tints every derived shadow), `backgroundColor`, `borderColor`, foreground.
// No hover/selected/focus state lives here (those are intents).
export const colorIntents = stylex.create({
  primary: {
    [shadowColor.color]: colorVariants.primaryBg,
    backgroundColor: colorVariants.primaryBg,
    borderColor: colorVariants.primaryBorder,
    color: colorVariants.primaryFg,
  },

  secondary: {
    [shadowColor.color]: colorVariants.secondaryBg,
    backgroundColor: colorVariants.secondaryBg,
    borderColor: colorVariants.secondaryBorder,
    color: colorVariants.secondaryFg,
  },

  accent: {
    [shadowColor.color]: colorVariants.accentBg,
    backgroundColor: colorVariants.accentBg,
    borderColor: colorVariants.accentBorder,
    color: colorVariants.accentFg,
  },

  warning: {
    [shadowColor.color]: colorVariants.warningBg,
    backgroundColor: colorVariants.warningBg,
    borderColor: colorVariants.warningBorder,
    color: colorVariants.warningFg,
  },

  destructive: {
    [shadowColor.color]: colorVariants.destructiveBg,
    backgroundColor: colorVariants.destructiveBg,
    borderColor: colorVariants.destructiveBorder,
    color: colorVariants.destructiveFg,
  },

  // Canonical muted (S8): neutral fill, signal through `Fg` (Muted Ink).
  // Widgets that must diverge (Slider fill/thumb, Segmented chosen, Radio
  // options, Toggle off) override the slice locally and document why.
  muted: {
    [shadowColor.color]: colorVariants.mutedBg,
    backgroundColor: colorVariants.mutedBg,
    borderColor: colorVariants.mutedBorder,
    color: colorVariants.mutedFg,
  },
});

// Background-only slice (Slider fill, Radio dot): muted signals through its
// `Fg` because the element sits on a `muted` track/well.
export const intentFills = stylex.create({
  primary: { backgroundColor: colorVariants.primaryBg },
  secondary: { backgroundColor: colorVariants.secondaryBg },
  accent: { backgroundColor: colorVariants.accentBg },
  warning: { backgroundColor: colorVariants.warningBg },
  destructive: { backgroundColor: colorVariants.destructiveBg },
  muted: { backgroundColor: colorVariants.mutedFg },
});

// Border-only slice (Slider thumb, Radio circle) — now also seeds the shadow
// tint so a variant's mark harmonizes border AND derived shadow (the Slider
// thumb's rest cast follows its family instead of a neutral gray). Same muted
// signal rule: `muted` = `Fg`.
export const intentBorders = stylex.create({
  primary: {
    borderColor: colorVariants.primaryBorder,
    [shadowColor.color]: colorVariants.primaryBg,
  },
  secondary: {
    borderColor: colorVariants.secondaryBorder,
    [shadowColor.color]: colorVariants.secondaryBg,
  },
  accent: {
    borderColor: colorVariants.accentBorder,
    [shadowColor.color]: colorVariants.accentBg,
  },
  warning: {
    borderColor: colorVariants.warningBorder,
    [shadowColor.color]: colorVariants.warningBg,
  },
  destructive: {
    borderColor: colorVariants.destructiveBorder,
    [shadowColor.color]: colorVariants.destructiveBg,
  },
  muted: {
    borderColor: colorVariants.mutedFg,
    [shadowColor.color]: colorVariants.mutedFg,
  },
});
