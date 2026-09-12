import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex.ts";
import { palette } from "./palette.stylex.ts";

export const lightTheme = stylex.createTheme(color, {
  // Surfaces
  background: palette.light0,
  surface: palette.light1,
  surfaceRaised: palette.light0,
  surfaceSunken: palette.light2,

  // Content
  text: palette.dark0,
  textMuted: palette.dark3,
  textSubtle: palette.dark4,

  // Structure
  border: "oklch(0% 0 0 / 8%)",
  borderHover: "oklch(0% 0 0 / 12%)",
  borderActive: "oklch(0% 0 0 / 18%)",

  // Semantic colors
  primary: palette.blue,
  secondary: palette.green,
  accent: palette.pink,
  warning: palette.orange,
  danger: palette.red,

  onPrimary: palette.light0,
  onSecondary: palette.light0,
  onAccent: palette.light0,
  onWarning: palette.dark0,
  onDanger: palette.light0,

  primaryBackground: "oklch(68% 0.105 235 / 10%)",
  secondaryBackground: "oklch(70% 0.115 125 / 10%)",
  accentBackground: "oklch(68% 0.135 350 / 10%)",
  warningBackground: "oklch(72% 0.145 55 / 10%)",
  dangerBackground: "oklch(65% 0.155 25 / 10%)",
});
