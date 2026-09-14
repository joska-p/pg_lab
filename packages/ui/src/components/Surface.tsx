import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { effects } from "../behaviors/effects.stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { colorIntents } from "../behaviors/intents.stylex";
import { shadowColor } from "../theme/shadows.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, motion, radius, space, typography } from "../theme/consts.stylex";

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
    flex: "1 1 160px",
    minHeight: 120,
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
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
  },

  tall: {
    minHeight: 300,
  },

  muted: {
    opacity: 0.45,
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
    backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${colors.secondary} 35%, transparent), color-mix(in oklab, ${colors.accent} 35%, transparent)), linear-gradient(135deg, ${colors.background}, ${colors.card})`,
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
  flat: effects.flat,
  raised: effects.raised,
  sunken: effects.sunken,
  floating: effects.floating,
  glass: effects.glass,
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
  const surfaceStyle =
    color !== undefined
      ? tints.canvas(color)
      : tint === "card"
        ? tints.card
        : tint === "backdrop"
          ? tints.backdrop
          : colorIntents[tint];

  const shadowEffect = pressable ? effects.pressable : elevations[elevation];
  const Comp = pressable ? "button" : "div";

  return (
    <Comp
      type={pressable ? "button" : undefined}
      {...stylex.props(
        styles.base,
        size === "tall" ? styles.tall : null,
        surfaceStyle,
        pressable ? interactive.base : null,
        pressable ? interactive.focusRing : null,
        shadowEffect,
        muted ? styles.muted : null,
        style,
      )}
    >
      <div {...stylex.props(styles.content(align))}>{children}</div>
      {label ? (
        <span {...stylex.props(styles.labelRow)}>
          {glow ? <span aria-hidden {...stylex.props(styles.dot, effects.glowSubtle)} /> : null}
          {label}
        </span>
      ) : null}
    </Comp>
  );
}
