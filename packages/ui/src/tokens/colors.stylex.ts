import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./palette.stylex";
import { transparency as alpha } from "./transparency.stylex";

const onFillForeground = `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`;

export const colors = stylex.defineVars({
  background: `light-dark(${palette.light1}, ${palette.dark0})`,
  foreground: onFillForeground,

  card: `light-dark(color-mix(in oklab, ${palette.light0} ${alpha.surfaceLight}, transparent), color-mix(in oklab, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}) ${alpha.surfaceDark}, transparent))`,
  cardForeground: onFillForeground,

  popover: `light-dark(color-mix(in oklab, ${palette.light0} ${alpha.popoverLight}, transparent), color-mix(in oklab, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}) ${alpha.popoverDark}, transparent))`,
  popoverForeground: onFillForeground,

  muted: `light-dark(color-mix(in oklab, ${palette.light3} ${alpha.mutedLight}, transparent), color-mix(in oklab, color-mix(in oklab, ${palette.dark2} 60%, ${palette.dark0}) ${alpha.mutedDark}, transparent))`,
  mutedForeground: `light-dark(color-mix(in oklab, ${palette.dark0Hard} 85%, ${palette.dark2}), ${palette.light3})`,
  mutedHover: `light-dark(${palette.light4}, ${palette.dark3})`,

  border: `light-dark(color-mix(in oklab, ${palette.light3} ${alpha.edgeLight}, transparent), color-mix(in oklab, ${palette.dark2} ${alpha.edgeDark}, transparent))`,
  input: `light-dark(color-mix(in oklab, ${palette.light2} ${alpha.inputLight}, transparent), color-mix(in oklab, color-mix(in oklab, ${palette.dark2} 35%, ${palette.dark0}) ${alpha.inputDark}, transparent))`,
  ring: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
});
