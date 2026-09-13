import * as stylex from "@stylexjs/stylex";
import { shadows } from "../theme/shadows.stylex.ts";

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
