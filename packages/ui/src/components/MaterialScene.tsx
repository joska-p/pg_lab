import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { families } from "../tokens/families.stylex";
import { borderWidth, radius, space } from "../tokens/layout.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { fx, glass } from "../recipes/effects.stylex";

const sceneStyles = stylex.create({
  base: {
    position: "relative",
    minHeight: "100%",
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    overflow: "hidden",
  },
  ground: {
    position: "absolute",
    inset: 0,
    backgroundColor: colors.card,
  },
  bleed: {
    position: "absolute",
    inset: "-32px",
  },
  ball: (color: string, left: string, top: string, size: string) => ({
    position: "absolute",
    left,
    top,
    width: size,
    height: size,
    borderRadius: radius.full,
    backgroundImage: `radial-gradient(circle at 50% 50%, ${color}, transparent 72%)`,
    filter: `blur(${fx.blurLg})`,
  }),
  wash: (color: string) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(145deg, color-mix(in oklab, ${color} 12%, transparent), transparent 58%)`,
  }),
  glassPane: (color: string) => ({
    position: "absolute",
    bottom: space["3"],
    right: space["3"],
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    paddingBlock: space["3"],
    paddingInline: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
    [shadowColor.color]: color,
    backgroundColor: `color-mix(in oklab, ${color} 16%, ${colors.background} 40%)`,
  }),
});

export type MaterialSceneProps = {
  colors?: {
    amber?: string;
    aqua?: string;
    violet?: string;
  };
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function MaterialScene({ colors: sceneColors, style, children }: MaterialSceneProps) {
  const amber = sceneColors?.amber ?? families.amber.base;
  const aqua = sceneColors?.aqua ?? families.aqua.base;
  const violet = sceneColors?.violet ?? families["neon-violet"].base;

  return (
    <div {...stylex.props(sceneStyles.base, style)}>
      <div {...stylex.props(sceneStyles.ground)} />
      <div {...stylex.props(sceneStyles.bleed)}>
        <span {...stylex.props(sceneStyles.ball(amber, "6%", "10%", "72%"))} />
        <span {...stylex.props(sceneStyles.ball(aqua, "52%", "44%", "58%"))} />
        <span {...stylex.props(sceneStyles.ball(violet, "28%", "52%", "34%"))} />
      </div>
      <div {...stylex.props(sceneStyles.wash(amber))} />

      <div {...stylex.props(glass.glass, sceneStyles.glassPane(aqua))}>{children}</div>
    </div>
  );
}
