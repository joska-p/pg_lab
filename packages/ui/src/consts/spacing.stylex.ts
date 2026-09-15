import * as stylex from "@stylexjs/stylex";

// Spacing scale (4px base). Numeric keys keep the design-token spelling used
// by `Stack` gap variants: ("0" | "1" | … | "16").
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
