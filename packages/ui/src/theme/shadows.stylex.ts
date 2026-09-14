import * as stylex from "@stylexjs/stylex";

// Single source of truth for shadow color (Phase B, S2): every shadow
// token derives from this variable via `color-mix`. An element opts into
// the automatic tint by setting it to its own background color with
// `[shadowColor.color]`. Elements that do not set it keep a neutral
// (black) shadow.
export const shadowColor = stylex.defineVars({
  color: "oklch(0% 0 0)",
});

export const shadows = stylex.defineConsts({
  rest: `0 1px 2px color-mix(in srgb, ${shadowColor.color} 20%, transparent), 0 1px 1px color-mix(in srgb, ${shadowColor.color} 12%, transparent)`,
  hover: `0 2px 8px color-mix(in srgb, ${shadowColor.color} 24%, transparent)`,
  active: `inset 0 1px 1px color-mix(in srgb, ${shadowColor.color} 20%, transparent)`,
  raised: `0 4px 12px color-mix(in srgb, ${shadowColor.color} 22%, transparent)`,
  floating: `0 8px 28px color-mix(in srgb, ${shadowColor.color} 28%, transparent), 0 2px 8px color-mix(in srgb, ${shadowColor.color} 20%, transparent)`,
  sunken: `inset 0 1px 2px color-mix(in srgb, ${shadowColor.color} 22%, transparent)`,
});
