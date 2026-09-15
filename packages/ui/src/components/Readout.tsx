import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { colors } from "../tokens/colors.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

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
