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
