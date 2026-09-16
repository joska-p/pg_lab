import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { layout } from "../consts/layout.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

const styles = stylex.create({
  base: {
    flex: 1,
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: layout.stageMinHeight,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    padding: space["6"],
    borderRadius: { default: radius.none, "@media (min-width: 1024px)": radius.md },
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.background,
    backgroundImage:
      `radial-gradient(115% 90% at 18% 14%, color-mix(in srgb, ${colors.primary} 24%, transparent), transparent 60%),` +
      `radial-gradient(80% 80% at 88% 20%, color-mix(in srgb, ${colors.accent} 18%, transparent), transparent 56%),` +
      `radial-gradient(110% 100% at 82% 92%, color-mix(in srgb, ${colors.warning} 20%, transparent), transparent 60%),` +
      `linear-gradient(150deg, ${colors.background}, ${colors.card})`,
    isolation: "isolate",
  },
});

type StageProps = {
  label?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Stage({ label, style, children }: StageProps) {
  return (
    <section aria-label={label ?? "stage"} {...stylex.props(styles.base, style)}>
      {children}
    </section>
  );
}
