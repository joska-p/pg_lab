import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../behaviors/text.stylex";
import { space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
    minHeight: 0,
    overflowY: "auto",
  },

  title: {
    margin: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },
});

type ControlPanelProps = {
  title?: string;
  label?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ControlPanel({ title, label, style, children }: ControlPanelProps) {
  return (
    <aside aria-label={label ?? title ?? "control panel"} {...stylex.props(styles.base, style)}>
      {title ? <h2 {...stylex.props(styles.title, fieldText.label)}>{title}</h2> : null}
      {children}
    </aside>
  );
}
