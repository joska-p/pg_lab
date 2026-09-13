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

  secondary: {
    default: palette.brightGreen,
    [DARK]: palette.fadedGreen,
  },

  secondaryForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  muted: {
    default: palette.light3,
    [DARK]: palette.dark2,
  },

  mutedForeground: {
    default: palette.dark3,
    [DARK]: palette.light4,
  },

  accent: {
    default: palette.brightPurple,
    [DARK]: palette.fadedPurple,
  },

  accentForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

  destructive: {
    default: palette.brightRed,
    [DARK]: palette.fadedRed,
  },

  destructiveForeground: {
    default: palette.dark0,
    [DARK]: palette.light1,
  },

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
});

export const radius = stylex.defineVars({
  none: "0px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
});

export const space = stylex.defineVars({
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
});

export const typography = stylex.defineVars({
  fontFamilySans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',

  fontSizeXs: "12px",
  fontSizeSm: "14px",
  fontSizeMd: "16px",
  fontSizeLg: "18px",
  fontSizeXl: "20px",
  fontSize2xl: "24px",
  fontSize3xl: "30px",

  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,

  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  letterSpacingTight: "-0.01em",
  letterSpacingNormal: "0",
  letterSpacingWide: "0.02em",
});
