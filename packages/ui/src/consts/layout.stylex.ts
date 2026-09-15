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
  surfaceMinHeight: "120px",
  surfaceTallMinHeight: "300px",

  // Surface tile flex shorthand.
  surfaceFlex: "1 1 160px",

  // Swatch demo tile.
  swatchMinWidth: "160px",
  swatchHeight: "64px",

  // Paragraph measure.
  textMaxWidth: "62ch",
});
