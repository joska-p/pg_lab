import * as stylex from "@stylexjs/stylex";
import { palette } from "./palette.stylex.ts";

export const color = stylex.defineVars({
  // ─────────────────────────────────────────
  // Surfaces
  // ─────────────────────────────────────────

  background: palette.dark0,
  surface: palette.dark1,
  surfaceRaised: palette.dark2,
  surfaceSunken: palette.dark0,

  // ─────────────────────────────────────────
  // Content
  // ─────────────────────────────────────────

  text: palette.light0,
  textMuted: palette.light2,
  textSubtle: palette.light3,

  // ─────────────────────────────────────────
  // Structure
  // ─────────────────────────────────────────

  border: "oklch(100% 0 0 / 7%)",
  borderHover: "oklch(100% 0 0 / 11%)",
  borderActive: "oklch(100% 0 0 / 16%)",

  // ─────────────────────────────────────────
  // Semantic colors
  // ─────────────────────────────────────────

  primary: palette.blue,
  primaryBackground: "oklch(68% 0.105 235 / 12%)",
  onPrimary: palette.dark0,

  secondary: palette.green,
  secondaryBackground: "oklch(70% 0.115 125 / 12%)",
  onSecondary: palette.dark0,

  accent: palette.pink,
  accentBackground: "oklch(68% 0.135 350 / 12%)",
  onAccent: palette.light0,

  warning: palette.orange,
  warningBackground: "oklch(72% 0.145 55 / 12%)",
  onWarning: palette.dark0,

  danger: palette.red,
  dangerBackground: "oklch(65% 0.155 25 / 12%)",
  onDanger: palette.light0,
});

export const radius = stylex.defineConsts({
  none: "0px",
  sm: "3px",
  md: "5px",
  lg: "7px",
  full: "9999px",
});

export const typography = stylex.defineConsts({
  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

  fontFamilyMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

  sizeXs: "11px",
  sizeSm: "12px",
  sizeMd: "14px",
  sizeLg: "16px",
  sizeXl: "20px",
  sizeXxl: "28px",

  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,

  lineTight: 1.2,
  lineNormal: 1.45,
});

export const space = stylex.defineConsts({
  "0": "0px",
  "1": "2px",
  "2": "4px",
  "3": "6px",
  "4": "8px",
  "5": "12px",
  "6": "16px",
  "7": "20px",
  "8": "24px",
  "9": "32px",
  "10": "40px",
});
