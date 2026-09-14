import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../behaviors/text.stylex";
import { space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    minHeight: 44,
    justifyContent: "center",
  },
});

type ControlFieldProps = {
  label?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

// lays out custom (non-widget) content with a plain title span. Widgets
// (Slider, Toggle, TextInput, …) carry their own associated <label>, so
// ControlField's label is intentionally not a <label> element: use it only
// for custom content titles, never as a duplicate widget label (Phase B,
// S10).
export function ControlField({ label, style, children }: ControlFieldProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      {label ? <span {...stylex.props(fieldText.label)}>{label}</span> : null}
      {children}
    </div>
  );
}
