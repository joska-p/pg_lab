import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "./gruvbox-palette.stylex.ts";

const DARK = "@media (prefers-color-scheme: dark)";

export const colors = stylex.defineVars({
  background: {
    default: palette.light1,
    [DARK]: palette.dark0,
  },

  foreground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  card: {
    default: palette.light0,
    [DARK]: palette.dark1,
  },

  cardForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  popover: {
    default: palette.light0,
    [DARK]: palette.dark1,
  },

  popoverForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  primary: {
    default: palette.brightBlue,
    [DARK]: palette.fadedBlue,
  },

  primaryForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  primaryHover: palette.neutralBlue,

  secondary: {
    default: palette.brightGreen,
    [DARK]: palette.fadedGreen,
  },

  secondaryForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  secondaryHover: palette.neutralGreen,

  muted: {
    default: palette.light3,
    [DARK]: palette.dark2,
  },

  mutedForeground: {
    default: palette.dark3,
    [DARK]: palette.light4,
  },

  mutedHover: {
    default: palette.light4,
    [DARK]: palette.dark3,
  },

  accent: {
    default: palette.brightPurple,
    [DARK]: palette.fadedPurple,
  },

  accentForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  accentHover: palette.neutralPurple,

  destructive: {
    default: palette.brightRed,
    [DARK]: palette.fadedRed,
  },

  destructiveForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  destructiveHover: palette.neutralRed,

  success: {
    default: palette.brightGreen,
    [DARK]: palette.fadedGreen,
  },

  successForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  warning: {
    default: palette.brightYellow,
    [DARK]: palette.fadedYellow,
  },

  warningForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  warningHover: palette.neutralYellow,

  border: {
    default: palette.light3,
    [DARK]: palette.dark3,
  },

  input: {
    default: palette.light2,
    [DARK]: palette.dark2,
  },

  ring: {
    default: palette.brightBlue,
    [DARK]: palette.fadedBlue,
  },

  shadow: "oklch(0% 0 0)",
});
