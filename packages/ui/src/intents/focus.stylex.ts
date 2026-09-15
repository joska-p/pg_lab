import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { shadowColor, shadows } from "../tokens/shadows.stylex";

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

// Text-entry focus (TextInput, NumberField, TextArea, Select — the four
// byte-identical local `focusVariants`): a mouse click into a text field must
// show the ring, so these target `:focus`, unlike pressable `:focus-visible`.
// Default rest is a real recess: `shadows.sunken`, whose tint is seeded by the
// `[shadowColor.color]` below — the well glows with its family at rest, so a
// variant's border/shadow language holds even before the focus ring lands
// (muted stays neutral: its signal is an explicit `Fg`, too bright for a
// shadow). The ring replaces the inset on focus. Consumes the variant `Ring`
// slot — the muted ring is Muted Ink, matching its signal.
export const fieldFocus = stylex.create({
  primary: {
    borderColor: { default: colors.border, ":focus": colorVariants.primaryBorder },
    [shadowColor.color]: colorVariants.primaryBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.primaryRing}`,
    },
  },

  secondary: {
    borderColor: { default: colors.border, ":focus": colorVariants.secondaryBorder },
    [shadowColor.color]: colorVariants.secondaryBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.secondaryRing}`,
    },
  },

  accent: {
    borderColor: { default: colors.border, ":focus": colorVariants.accentBorder },
    [shadowColor.color]: colorVariants.accentBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.accentRing}`,
    },
  },

  warning: {
    borderColor: { default: colors.border, ":focus": colorVariants.warningBorder },
    [shadowColor.color]: colorVariants.warningBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.warningRing}`,
    },
  },

  destructive: {
    borderColor: { default: colors.border, ":focus": colorVariants.destructiveBorder },
    [shadowColor.color]: colorVariants.destructiveBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.destructiveRing}`,
    },
  },

  muted: {
    borderColor: { default: colors.border, ":focus": colorVariants.mutedFg },
    [shadowColor.color]: colorVariants.mutedBg,
    boxShadow: {
      default: shadows.sunken,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colorVariants.mutedRing}`,
    },
  },
});
