import * as stylex from "@stylexjs/stylex";
import { shadowColor, shadows } from "../theme/shadows.stylex";
import { colors } from "../theme/tokens.stylex";

export const effects = stylex.create({
  glow: {
    filter: "drop-shadow(0 0 8px currentColor)",
  },

  glowSubtle: {
    filter: "drop-shadow(0 0 5px currentColor)",
  },

  glowStrong: {
    filter: "drop-shadow(0 0 12px currentColor)",
  },

  // Small opaque box-shadow halo tinted by the element's `shadowColor`.
  // On/off widgets apply a `colorIntents[variant]` map first (which sets
  // `[shadowColor.color]` to the family), so the ring follows the family:
  // an effect tinted via the shadow variable — not a raw per-family map.
  glowRing: {
    boxShadow: `0 0 6px color-mix(in oklab, ${shadowColor.color} 55%, transparent)`,
  },

  raised: {
    boxShadow: shadows.raised,
  },

  // Elevation model (Phase B): flat = no cast shadow, border only;
  // raised = tinted diffuse cast shadow; sunken = inset (embedded).
  // Glow stays orthogonal: state accent, not elevation.
  flat: {
    boxShadow: "none",
  },

  sunken: {
    boxShadow: shadows.sunken,
  },

  // Pressable: rest → hover → active, plus an explicit `:focus-visible` that
  // COMPOSES the keyboard ring onto the rest cast (box-shadow is a list), so
  // focus no longer replaces the lift — the old focusRing-then-pressable
  // merge dropped the resting elevation exactly while keyboard-focused.
  pressable: {
    boxShadow: {
      default: shadows.rest,
      ":hover": shadows.hover,
      ":active": shadows.active,
      ":focus-visible": `${shadows.rest}, 0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },

  floating: {
    boxShadow: shadows.floating,
  },

  // Glass (D1): translucent surface + blur for floating UI over a backdrop.
  // Only meaningful where content sits behind the element (floating panel,
  // overlays) — in-flow surfaces stay opaque so text contrast never depends
  // on what's behind them.
  // D4: deepened 30% → 45% opacity so the panel keeps a stable dark ground
  // even over bright stage content, and mixed in oklab (the tint blend is
  // endpoint-identical, but matches the palette's color model).
  // Critique fix: the cast depth comes from `shadows.floating` (which derives
  // from `--shadow-color`) instead of a hardcoded `background` halo — a glass
  // panel no longer emits a light under-glow that only works on a cream stage,
  // and stacking with `floating` is now a harmless no-op instead of a
  // last-wins shadow override.

  glass: {
    backgroundColor: `color-mix(in oklab, ${colors.background} 45%, transparent)`,
    backdropFilter: "blur(24px) saturate(180%)",
    borderColor: `color-mix(in oklab, ${colors.foreground} 12%, transparent)`,
    boxShadow: shadows.floating,
  },

  blurSm: {
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
  },

  blurMd: {
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },

  blurLg: {
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  blurFab: {
    backdropFilter: "blur(8px) saturate(1.4)",
    WebkitBackdropFilter: "blur(8px) saturate(1.4)",
  },
});
