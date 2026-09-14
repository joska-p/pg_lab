import * as stylex from "@stylexjs/stylex";
import { shadowColor, shadows } from "../theme/shadows.stylex";
import { colors } from "../theme/tokens.stylex";

// Stateless six-family color intents (`primary | secondary | accent | warning
// | destructive | muted`). These are the shared variant maps (component-
// authoring.md §5): each carries only the base surface — `[shadowColor.color]`
// (tints every derived shadow), `backgroundColor` (default only), `borderColor`,
// foreground. Components compose their own interaction states (hover, selected)
// locally on top of these primitives.

export const colorIntents = stylex.create({
  primary: {
    [shadowColor.color]: colors.primary,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.primaryForeground,
  },

  secondary: {
    [shadowColor.color]: colors.secondary,
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    color: colors.secondaryForeground,
  },

  accent: {
    [shadowColor.color]: colors.accent,
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    color: colors.accentForeground,
  },

  warning: {
    [shadowColor.color]: colors.warning,
    backgroundColor: colors.warning,
    borderColor: colors.warning,
    color: colors.warningForeground,
  },

  destructive: {
    [shadowColor.color]: colors.destructive,
    backgroundColor: colors.destructive,
    borderColor: colors.destructive,
    color: colors.destructiveForeground,
  },

  // Canonical muted (S8): neutral fill, signal through mutedForeground.
  // Widgets that must diverge (Slider fill/thumb, Segmented chosen, Radio
  // options, Toggle off) override the slice locally and document why.
  muted: {
    [shadowColor.color]: colors.muted,
    backgroundColor: colors.muted,
    borderColor: colors.muted,
    color: colors.mutedForeground,
  },
});

// Shared `background-color` hover (three consumers — Button, Toggle-on,
// Checkbox-on — byte-identical). Unlike selected/active states, `:hover` has
// no "last applied wins" ordering problem, so it stays safe to share.
export const intentHovers = stylex.create({
  primary: { backgroundColor: { ":hover": colors.primaryHover } },
  secondary: { backgroundColor: { ":hover": colors.secondaryHover } },
  accent: { backgroundColor: { ":hover": colors.accentHover } },
  warning: { backgroundColor: { ":hover": colors.warningHover } },
  destructive: { backgroundColor: { ":hover": colors.destructiveHover } },
  muted: { backgroundColor: { ":hover": colors.mutedHover } },
});

// Background-only slice (Slider fill, Radio dot): muted signals through
// `mutedForeground` because the element sits on a `muted` track/well.
export const intentFills = stylex.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  accent: { backgroundColor: colors.accent },
  warning: { backgroundColor: colors.warning },
  destructive: { backgroundColor: colors.destructive },
  muted: { backgroundColor: colors.mutedForeground },
});

// Border-only slice (Slider thumb, Radio circle) — now also seeds the shadow
// tint so a variant's mark harmonizes border AND derived shadow (the Slider
// thumb's rest cast follows its family instead of a neutral gray). Same muted
// signal rule: `muted` = `mutedForeground`.
export const intentBorders = stylex.create({
  primary: {
    borderColor: colors.primary,
    [shadowColor.color]: colors.primary,
  },
  secondary: {
    borderColor: colors.secondary,
    [shadowColor.color]: colors.secondary,
  },
  accent: {
    borderColor: colors.accent,
    [shadowColor.color]: colors.accent,
  },
  warning: {
    borderColor: colors.warning,
    [shadowColor.color]: colors.warning,
  },
  destructive: {
    borderColor: colors.destructive,
    [shadowColor.color]: colors.destructive,
  },
  muted: {
    borderColor: colors.mutedForeground,
    [shadowColor.color]: colors.mutedForeground,
  },
});

// Text-entry focus (TextInput, NumberField, TextArea, Select — the four
// byte-identical local `focusVariants`): a mouse click into a text field must
// show the ring, so these target `:focus`, unlike pressable `:focus-visible`.
// Default rest is a real recess: `shadows.sunken`, whose tint is seeded by the
// `[shadowColor.color]` below — the well glows with its family at rest, so a
// variant's border/shadow language holds even before the focus ring lands
// (muted stays neutral: its signal is an explicit `mutedForeground`, too
// bright for a shadow). The ring replaces the inset on focus.
export const fieldFocus = stylex.create({
  primary: {
    borderColor: { default: colors.border, ":focus": colors.primary },
    [shadowColor.color]: colors.primary,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.primary}`,
    },
  },

  secondary: {
    borderColor: { default: colors.border, ":focus": colors.secondary },
    [shadowColor.color]: colors.secondary,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.secondary}`,
    },
  },

  accent: {
    borderColor: { default: colors.border, ":focus": colors.accent },
    [shadowColor.color]: colors.accent,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.accent}`,
    },
  },

  warning: {
    borderColor: { default: colors.border, ":focus": colors.warning },
    [shadowColor.color]: colors.warning,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.warning}`,
    },
  },

  destructive: {
    borderColor: { default: colors.border, ":focus": colors.destructive },
    [shadowColor.color]: colors.destructive,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.destructive}`,
    },
  },

  muted: {
    borderColor: { default: colors.border, ":focus": colors.mutedForeground },
    [shadowColor.color]: colors.muted,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.mutedForeground}`,
    },
  },
});
