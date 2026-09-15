import * as stylex from "@stylexjs/stylex";
import { fx } from "../consts/effects.stylex";
import { colors } from "../tokens/colors.stylex";
import { shadowColor } from "../tokens/shadows.stylex";

// Glass (D1): translucent surface + blur for floating UI over a backdrop.
// Only meaningful where content sits behind the element (floating panel,
// overlays) — in-flow surfaces stay opaque so text contrast never depends
// on what's behind them (Glass-on-Floating-Only Rule).
// D4: deepened 30% → 45% opacity so the panel keeps a stable dark ground
// even over bright stage content, and mixed in oklab (the tint blend is
// endpoint-identical, but matches the palette's color model).
// The cast depth derives from `shadowColor` (never a hardcoded `background`
// halo), so a glass panel no longer emits a light under-glow that only works
// on a cream stage, and stacking with `floating` is a harmless no-op.
export const glass = stylex.create({
  glass: {
    backgroundColor: `color-mix(in oklab, ${colors.background} ${fx.glassTint}, transparent)`,
    backdropFilter: `blur(${fx.glassBlur}) saturate(${fx.glassSaturate})`,
    boxShadow: `0 8px 28px color-mix(in oklab, ${shadowColor.color} ${fx.glassCastA}, transparent), 0 2px 8px color-mix(in oklab, ${shadowColor.color} ${fx.glassCastB}, transparent)`,
  },

  blurSm: {
    backdropFilter: `blur(${fx.blurSm})`,
    WebkitBackdropFilter: `blur(${fx.blurSm})`,
  },

  blurMd: {
    backdropFilter: `blur(${fx.blurMd})`,
    WebkitBackdropFilter: `blur(${fx.blurMd})`,
  },

  blurLg: {
    backdropFilter: `blur(${fx.blurLg})`,
    WebkitBackdropFilter: `blur(${fx.blurLg})`,
  },

  blurFab: {
    backdropFilter: fx.blurFab,
    WebkitBackdropFilter: fx.blurFab,
  },
});
