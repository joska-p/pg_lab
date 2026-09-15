import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { glass } from "../effects/glass.stylex";
import { fx } from "../consts/effects.stylex";
import { layout } from "../consts/layout.stylex";
import { radius } from "../consts/radius.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { space } from "../consts/spacing.stylex";

const sceneStyles = stylex.create({
  base: {
    position: "relative",
    minHeight: layout.surfaceTallMinHeight,
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
  colors: {
    amber: string;
    aqua: string;
    violet: string;
  };
  children?: React.ReactNode;
};

export function MaterialScene({ colors: sceneColors, children }: MaterialSceneProps) {
  return (
    <div {...stylex.props(sceneStyles.base)}>
      <div {...stylex.props(sceneStyles.ground)} />
      <div {...stylex.props(sceneStyles.bleed)}>
        <span {...stylex.props(sceneStyles.ball(sceneColors.amber, "6%", "10%", "72%"))} />
        <span {...stylex.props(sceneStyles.ball(sceneColors.aqua, "52%", "44%", "58%"))} />
        <span {...stylex.props(sceneStyles.ball(sceneColors.violet, "28%", "52%", "34%"))} />
      </div>
      <div {...stylex.props(sceneStyles.wash(sceneColors.amber))} />

      {/* wellStrip - maybe I should make this optional or remove it if I just want the material? */}

      <div {...stylex.props(glass.glass, sceneStyles.glassPane(sceneColors.aqua))}>{children}</div>
    </div>
  );
}
