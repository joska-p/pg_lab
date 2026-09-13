import * as stylex from "@stylexjs/stylex";

export const shadowColor = stylex.defineVars({
  color: "oklch(0% 0 0)",
});

export const shadows = stylex.defineConsts({
  rest: `0 1px 2px color-mix(in srgb, ${shadowColor.color} 16%, transparent), 0 1px 1px color-mix(in srgb, ${shadowColor.color} 10%, transparent)`,
  hover: `0 2px 8px color-mix(in srgb, ${shadowColor.color} 20%, transparent)`,
  active: `inset 0 1px 1px color-mix(in srgb, ${shadowColor.color} 20%, transparent)`,
  raised: `0 2px 8px color-mix(in srgb, ${shadowColor.color} 18%, transparent)`,
  floating: `0 6px 24px color-mix(in srgb, ${shadowColor.color} 24%, transparent), 0 2px 6px color-mix(in srgb, ${shadowColor.color} 18%, transparent)`,
});
