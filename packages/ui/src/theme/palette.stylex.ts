import * as stylex from "@stylexjs/stylex";

export const palette = stylex.defineConsts({
  // Gruvbox-inspired neutrals
  dark0: "oklch(19% 0.018 75)",
  dark1: "oklch(23% 0.018 75)",
  dark2: "oklch(28% 0.020 70)",
  dark3: "oklch(34% 0.022 68)",
  dark4: "oklch(40% 0.024 65)",

  light0: "oklch(96% 0.018 85)",
  light1: "oklch(91% 0.022 82)",
  light2: "oklch(84% 0.026 78)",
  light3: "oklch(72% 0.030 72)",

  // Semantic hue families
  blue: "oklch(68% 0.105 235)",
  green: "oklch(70% 0.115 125)",
  pink: "oklch(68% 0.135 350)",
  orange: "oklch(72% 0.145 55)",
  red: "oklch(65% 0.155 25)",
  yellow: "oklch(82% 0.145 90)",
});
