import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./palette.stylex";

export const shadowColor = stylex.defineVars({
  color: "oklch(0% 0 0)",
});

export const shadows = stylex.defineVars({
  rest: `0 1px 2px color-mix(in oklab, ${shadowColor.color} 18%, transparent), 0 1px 1px color-mix(in oklab, ${shadowColor.color} 10%, transparent)`,
  hover: `0 2px 8px color-mix(in oklab, ${shadowColor.color} 36%, transparent)`,
  active: `inset 0 1px 1px color-mix(in oklab, ${shadowColor.color} 18%, transparent)`,
  raised: `0 4px 12px color-mix(in oklab, ${shadowColor.color} 30%, transparent)`,
  floating: `0 8px 28px color-mix(in oklab, ${shadowColor.color} 45%, transparent), 0 2px 8px color-mix(in oklab, ${shadowColor.color} 30%, transparent)`,
  sunken: `inset 0 1px 0 color-mix(in oklab, ${shadowColor.color} 88%, light-dark(white, ${palette.dark4})), inset 0 1px 3px color-mix(in oklab, ${shadowColor.color} 16%, transparent)`,
});
