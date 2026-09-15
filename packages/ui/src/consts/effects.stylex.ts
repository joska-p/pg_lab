import * as stylex from "@stylexjs/stylex";

// Visual-effect recipe constants (glow blur scale, glass blend, backdrop
// blur scale). These are fixed non-themable tuning values consumed by
// `effects/*` styles. Blur radii are px; blend/percentage recipes carry
// their own unit.
export const fx = stylex.defineConsts({
  // Glow blur radii (drop-shadow on currentColor).
  glowSubtleBlur: "5px",
  glowBlur: "8px",
  glowStrongBlur: "12px",
  glowRing: "6px",
  glowRingCast: "55%",

  // Glass blend (floating UI only).
  glassBlur: "24px",
  glassSaturate: "180%",
  glassTint: "45%",
  glassCastA: "22%",
  glassCastB: "15%",

  // Backdrop blur scale.
  blurSm: "3px",
  blurMd: "8px",
  blurLg: "16px",
  blurFab: "8px saturate(1.4)",
});
