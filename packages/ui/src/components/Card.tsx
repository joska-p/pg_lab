import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
});

type CardProps = {
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Card({ style, children }: CardProps) {
  return <div {...stylex.props(styles.base, style)}>{children}</div>;
}
