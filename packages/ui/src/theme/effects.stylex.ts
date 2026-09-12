import * as stylex from "@stylexjs/stylex";

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
    boxShadow: "0 2px 8px oklch(0% 0 0 / 18%)",
  },

  floating: {
    boxShadow: "0 6px 24px oklch(0% 0 0 / 24%), 0 2px 6px oklch(0% 0 0 / 18%)",
  },
});
