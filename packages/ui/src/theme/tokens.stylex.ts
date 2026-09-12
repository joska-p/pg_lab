import * as stylex from "@stylexjs/stylex";
import { palette } from "./palette.stylex.ts";

export const color = stylex.defineVars({
  background: palette.bg0Hard,
  surface: palette.bg0,
  surfaceElevated: palette.bg1,
  text: palette.fg1,
  textMuted: palette.fg3,
  textDisabled: palette.bg4,
  border: palette.bg2,
  borderHover: palette.bg3,
  borderActive: palette.orangeActive,
  accent: palette.orange,
  accentHover: palette.orangeHover,
  accentActive: palette.orangeActive,
  onAccent: palette.black,
  success: palette.green,
  warning: palette.yellow,
  error: palette.red,
});

export const space = stylex.defineVars({
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
});

export const radius = stylex.defineVars({
  sm: "4px",
  md: "6px",
  lg: "8px",
});

export const typography = stylex.defineVars({
  fontSans: 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontMono: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace',
  sizeBody: "14px",
  sizeLabel: "12px",
  sizeValue: "12px",
  sizeCaption: "11px",
  lineBody: 1.45,
  lineLabel: 1.4,
  lineValue: 1.4,
  lineCaption: 1.35,
  weightRegular: 400,
  weightMedium: 500,
  weightSemibold: 600,
});

export const shadow = stylex.defineVars({
  panel: "0 1px 2px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(0, 0, 0, 0.35)",
  overlay: "0 4px 16px rgba(0, 0, 0, 0.5), 0 16px 48px rgba(0, 0, 0, 0.55)",
});

export const blur = stylex.defineVars({
  panel: "12px",
  overlay: "24px",
});
