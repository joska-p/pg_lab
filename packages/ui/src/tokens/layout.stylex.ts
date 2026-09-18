import * as stylex from "@stylexjs/stylex";

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

export const radius = stylex.defineConsts({
  none: "0px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
});

export const borderWidth = stylex.defineConsts({
  hairline: "1px",
});

export const zIndex = stylex.defineConsts({
  base: 0,
  canvas: 1,
  overlay: 100,
  panel: 200,
  modal: 300,
});

export const breakpoints = stylex.defineConsts({
  narrowMax: 720,
  wideMin: 1024,
});

export const media = stylex.defineConsts({
  narrow: "@media (max-width: 720px)",
  wide: "@media (min-width: 1024px)",
  portrait: "@media (orientation: portrait)",
});

export const layout = stylex.defineConsts({
  panelWidth: "320px",
  panelMaxMobileHeight: "300px",
  panelGap: "12px",

  controlFieldMinHeight: "44px",
  stageMinHeight: "240px",
  sceneMinHeight: "300px",

  controlTouchTarget: "44px",

  toggleTrackWidth: "34px",
  toggleTrackHeight: "20px",
  toggleKnobSize: "14px",
  toggleKnobTravel: "16px",

  checkboxSize: "18px",
  checkboxMarkSize: "12px",

  radioOptionMinHeight: "28px",
  radioCircleSize: "16px",
  radioDotSize: "8px",

  segmentPadBlock: "1px",
  ledAtomSize: "7px",

  colorSwatchWidth: "36px",
  colorSwatchHeight: "26px",
  colorSwatchPad: "2px",

  chevronSize: "12px",
  spinnerSize: "12px",
  spinnerRingWidth: "2px",
  chipPadBlock: "2px",

  sliderRailHeight: "4px",
  sliderThumbSize: "14px",

  swatchMinWidth: "160px",
  swatchHeight: "64px",
  textMaxWidth: "62ch",
});

export const interaction = stylex.defineConsts({
  cursorPointer: "pointer",
  cursorProgress: "progress",
  cursorNotAllowed: "not-allowed",
  disabledOpacity: 0.45,
  pressScale: 0.98,
});
