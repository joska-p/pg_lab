import * as stylex from "@stylexjs/stylex";

export const borderWidth = stylex.defineConsts({
  hairline: "1px",
});

export const motion = stylex.defineConsts({
  durationFast: "120ms",
  durationNormal: "200ms",
  durationSlow: "320ms",
  easingOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easingInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
});

export const zIndex = stylex.defineConsts({
  base: 0,
  canvas: 1,
  overlay: 100,
  panel: 200,
  modal: 300,
});

export const radius = stylex.defineConsts({
  none: "0px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
});

export const space = stylex.defineConsts({
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

export const typography = stylex.defineConsts({
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
