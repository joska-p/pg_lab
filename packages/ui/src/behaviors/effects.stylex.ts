import * as stylex from "@stylexjs/stylex";
import { shadows } from "../theme/shadows.stylex";
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

  pressable: {
    boxShadow: {
      default: shadows.rest,
      ":hover": shadows.hover,
      ":active": shadows.active,
    },
  },

  floating: {
    boxShadow: shadows.floating,
  },

  // Glass (D1): translucent surface + blur for floating UI over a backdrop.
  // Only meaningful where content sits behind the element (floating panel,
  // overlays) — in-flow surfaces stay opaque so text contrast never depends
  // on what's behind them.

  glass: {
    backgroundColor: `color-mix(in srgb, ${colors.background} 30%, transparent)`,
    backdropFilter: "blur(24px) saturate(180%)",
    borderColor: `color-mix(in srgb, ${colors.foreground} 12%, transparent)`,
    boxShadow: `0 8px 32px color-mix(in srgb, ${colors.background} 50%, transparent)`,
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
