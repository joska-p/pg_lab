import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./palette.stylex";

const onFillForeground = `light-dark(color-mix(in oklab, ${palette.dark0} 80%, black), ${palette.light0Hard})`;

export const colors = stylex.defineVars({
  background: `light-dark(${palette.light1}, ${palette.dark0})`,
  foreground: onFillForeground,

  card: `light-dark(${palette.light0}, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}))`,
  cardForeground: onFillForeground,

  popover: `light-dark(${palette.light0}, color-mix(in oklab, ${palette.dark1} 55%, ${palette.dark0}))`,
  popoverForeground: onFillForeground,

  muted: `light-dark(${palette.light3}, color-mix(in oklab, ${palette.dark2} 60%, ${palette.dark0}))`,
  mutedForeground: `light-dark(color-mix(in oklab, ${palette.dark0Hard} 85%, ${palette.dark2}), ${palette.light3})`,
  mutedHover: `light-dark(${palette.light4}, ${palette.dark3})`,

  border: `light-dark(color-mix(in oklab, ${palette.light3} 75%, transparent), color-mix(in oklab, ${palette.dark2} 70%, transparent))`,
  input: `light-dark(${palette.light2}, color-mix(in oklab, ${palette.dark2} 35%, ${palette.dark0}))`,
  ring: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
});
