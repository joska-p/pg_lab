import * as stylex from "@stylexjs/stylex";

// Responsive breakpoints. Values are also exposed as `media` query strings —
// StyleX resolves an `@media` key from a const, so components reference these
// instead of repeating pixel literals:
//
//   flexDirection: { default: "row", [media.narrow]: "column" }
//
// Keep `media` strings and the numeric values in sync (the query embeds the
// pixel value as a literal string).
export const breakpoints = stylex.defineConsts({
  narrowMax: 720,
  wideMin: 1024,
});

export const media = stylex.defineConsts({
  narrow: "@media (max-width: 720px)",
  wide: "@media (min-width: 1024px)",
  portrait: "@media (orientation: portrait)",
});
