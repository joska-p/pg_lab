import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    flex: 1,
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: 240,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    padding: space["6"],
    borderRadius: radius.lg,
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
