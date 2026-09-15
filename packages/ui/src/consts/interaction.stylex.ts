import * as stylex from "@stylexjs/stylex";

// Interaction feedback metrics shared by widgets and intents.
export const interaction = stylex.defineConsts({
  cursorPointer: "pointer",
  cursorProgress: "progress",
  cursorNotAllowed: "not-allowed",
  disabledOpacity: 0.45,
  pressScale: 0.98,
});
