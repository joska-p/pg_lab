import * as stylex from "@stylexjs/stylex";

export const typography = stylex.defineConsts({
  fontFamilySans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',

  fontSizeXs: "0.75rem",
  fontSizeSm: "0.875rem",
  fontSizeMd: "1rem",
  fontSizeLg: "1.125rem",
  fontSizeXl: "1.25rem",
  fontSize2xl: "1.5rem",
  fontSize3xl: "1.875rem",

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

  textCaseUppercase: "uppercase",
});
