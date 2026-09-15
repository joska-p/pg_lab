import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { elevation } from "../effects/elevation.stylex";
import { glass } from "../effects/glass.stylex";
import { glow as glowEffect } from "../effects/glow.stylex";
import { pressable as pressableIntent } from "../intents/pressable.stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { focusRing } from "../intents/focus.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { colorIntents } from "../foundations/surface.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { colors } from "../tokens/colors.stylex";
import { interaction } from "../consts/interaction.stylex";
import { layout } from "../consts/layout.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { motion } from "../consts/motion.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";
import { MaterialScene } from "./MaterialScene";

type Elevation = "flat" | "raised" | "sunken" | "floating" | "glass";
type Tint = "card" | "backdrop" | keyof typeof colorIntents;

// The elevation ladder as a component: one geometry, one canvas, one shadow.
// `tint` picks the fill AND the shadow tint (`[shadowColor.color]`, the
// shadow-paints-itself opt-in); `color` is the raw dynamic variant (a canvas
// tinted by caller state, e.g. a synth visual). Elevation is orthogonal and
// stacks after the canvas.

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    flex: layout.surfaceFlex,
    minHeight: layout.surfaceMinHeight,
    padding: space["8"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    boxSizing: "border-box",
    transitionProperty: "opacity",
    transitionDuration: motion.durationNormal,
    transitionTimingFunction: motion.easingOut,
  },

  content: (align: "end" | "center") => ({
    display: "flex",
    flex: 1,
    minWidth: 0,
    alignItems: align === "center" ? "center" : "flex-end",
    justifyContent: align === "center" ? "center" : "flex-end",
  }),

  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  dot: {
    flexShrink: 0,
    width: "7px",
    height: "7px",
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
  },

  tall: {
    minHeight: layout.surfaceTallMinHeight,
  },

  muted: {
    opacity: interaction.disabledOpacity,
  },
});

const tints = stylex.create({
  card: {
    [shadowColor.color]: colors.card,
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },

  backdrop: {
    [shadowColor.color]: colors.card,
    backgroundColor: colors.background,
    backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${colors.muted} 35%, transparent), color-mix(in oklab, ${colors.accent} 35%, transparent)), linear-gradient(135deg, ${colors.background}, ${colors.card})`,
    color: colors.cardForeground,
  },

  canvas: (color: string) => ({
    [shadowColor.color]: color,
    backgroundColor: colors.background,
    backgroundImage: `radial-gradient(120% 120% at 25% 20%, ${color}59, transparent 60%), linear-gradient(135deg, ${colors.background}, ${colors.card})`,
    color: colors.cardForeground,
  }),
});

const elevations: Record<Elevation, StyleXStyles> = {
  flat: elevation.flat,
  raised: elevation.raised,
  sunken: elevation.sunken,
  floating: elevation.floating,
  glass: glass.glass,
};

type SurfaceProps = {
  elevation?: Elevation;
  tint?: Tint;
  color?: string;
  interactive?: boolean;
  muted?: boolean;
  glow?: boolean;
  align?: "end" | "center";
  size?: "tile" | "tall";
  label?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

// Helper to derive surface styles from a family or neutral tint.
const getSurfaceTint = (tint: Tint, color?: string): StyleXStyles => {
  if (color) {
    return tints.canvas(color);
  }

  if (tint === "card") return tints.card;
  if (tint === "backdrop") return tints.backdrop;

  // Migration point: Use families or base colors instead of colorIntents
  const family = families[tint as FamilyName];
  if (family) {
    const style = {
      [shadowColor.color]: family.base,
      backgroundColor: family.base,
      borderColor: `color-mix(in oklab, ${family.strong} 60%, transparent)`,
      color: family.ink ? family.ink.fg : colors.foreground,
    } as StyleXStyles;
    return style;
  }

  return colorIntents[tint];
};

export function Surface({
  elevation = "flat",
  tint = "card",
  color,
  interactive: pressable = false,
  muted = false,
  glow = false,
  align = "end",
  size = "tile",
  label,
  style,
  children,
}: SurfaceProps) {
  const surfaceStyle = getSurfaceTint(tint, color);

  const shadowEffect = pressable ? pressableIntent.base : elevations[elevation];
  const Comp = pressable ? "button" : "div";

  if (elevation === "glass") {
    return (
      <MaterialScene
        colors={{
          amber: color || colors.accent,
          aqua: color || colors.accent,
          violet: color || colors.accent,
        }}
      >
        <div {...stylex.props(styles.content(align))}>{children}</div>
      </MaterialScene>
    );
  }

  return (
    <Comp
      type={pressable ? "button" : undefined}
      {...stylex.props(
        styles.base,
        size === "tall" ? styles.tall : null,
        surfaceStyle,
        pressable ? interactiveBase.base : null,
        pressable ? focusRing.base : null,
        shadowEffect,
        muted ? styles.muted : null,
        style,
      )}
    >
      <div {...stylex.props(styles.content(align))}>{children}</div>
      {label ? (
        <span {...stylex.props(styles.labelRow)}>
          {glow ? <span aria-hidden {...stylex.props(styles.dot, glowEffect.glowSubtle)} /> : null}
          {label}
        </span>
      ) : null}
    </Comp>
  );
}
