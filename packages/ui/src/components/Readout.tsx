import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../behaviors/text.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["3"],
    paddingBlock: space["1"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
});

type ReadoutProps = {
  label: string;
  value?: React.ReactNode;
  style?: StyleXStyles;
};

export function Readout({ label, value, style }: ReadoutProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      <span {...stylex.props(fieldText.label)}>{label}</span>
      <span {...stylex.props(fieldText.value)}>{value}</span>
    </div>
  );
}
