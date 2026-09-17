import * as stylex from "@stylexjs/stylex";

// Layout metrics: panels, containers and text measure. Non-themable. Fixed
// geometry uses px (hit targets, panel widths); text measure uses ch.
export const layout = stylex.defineConsts({
  // ExperimentShell panel geometry.
  panelWidth: "280px",
  panelMaxMobileHeight: "300px",
  panelGap: "12px",

  // Minimum heights for control rows / canvas surfaces.
  controlFieldMinHeight: "44px",
  stageMinHeight: "240px",
  sceneMinHeight: "300px",

  // Control touch targets (WCAG 2.5.8). `controlTouchTarget` is the guaranteed
  // interactive square; a widget keeps a compact visual stroke and either pads
  // out to it (touch helper) or sizes up to it (slider band, radio rows,
  // segmented strip, buttons).
  controlTouchTarget: "44px",

  // Toggle footprint. The visible track stays small; the hit box expands to
  // `controlTouchTarget` via the touch helper, keeping the stroke tight.
  toggleTrackWidth: "34px",
  toggleTrackHeight: "20px",
  toggleKnobSize: "14px",
  toggleKnobTravel: "16px",

  // Checkbox footprint.
  checkboxSize: "18px",
  checkboxMarkSize: "12px",

  // RadioGroup footprint.
  radioOptionMinHeight: "28px",
  radioCircleSize: "16px",
  radioDotSize: "8px",

  // Segmented strip footprint.
  segmentPadBlock: "1px",

  // Visual atoms (allowed to stay small by the touch policy: marks, not
  // targets). LED = the identity dot shared by widgets, headings, badges.
  ledAtomSize: "7px",

  // Native color-picker well (ColorField) — the input box the browser paints.
  colorSwatchWidth: "36px",
  colorSwatchHeight: "26px",
  colorSwatchPad: "2px",

  // Icon atoms: select chevron, button spinner.
  chevronSize: "12px",
  spinnerSize: "12px",
  spinnerRingWidth: "2px",

  // Chip/badge inline pad (visual atom, not a spacing step).
  chipPadBlock: "2px",

  // Slider rail anatomy. The container itself becomes the touch band; the 4px
  // rail and 14px thumb stay centered on it.
  sliderRailHeight: "4px",
  sliderThumbSize: "14px",

  // Swatch demo tile.
  swatchMinWidth: "160px",
  swatchHeight: "64px",

  // Paragraph measure.
  textMaxWidth: "62ch",
});
