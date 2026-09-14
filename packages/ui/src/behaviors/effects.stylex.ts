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

  // Subtle monochrome grain (D1): adds tactile texture over a surface's own
  // background color without shifting its hue. Keep opacity near-invisible.
  grain: {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='144'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='144' height='144' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
  },

  // Glass (D1): translucent surface + blur for floating UI over a backdrop.
  // Only meaningful where content sits behind the element (floating panel,
  // overlays) — in-flow surfaces stay opaque so text contrast never depends
  // on what's behind them.
  glass: {
    backgroundColor: `color-mix(in srgb, ${colors.card} 72%, transparent)`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
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
