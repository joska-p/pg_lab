import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { layout, space } from "../tokens/layout.stylex";
import { fieldText } from "../recipes/typography.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    minHeight: layout.controlFieldMinHeight,
    justifyContent: "center",
  },
});

type ControlFieldProps = {
  label?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ControlField({ label, style, children }: ControlFieldProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      {label ? <span {...stylex.props(fieldText.label)}>{label}</span> : null}
      {children}
    </div>
  );
}
