import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    position: "relative",
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
