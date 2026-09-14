import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { effects } from "../behaviors/effects.stylex";
import { colors } from "../theme/tokens.stylex";
import { space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    width: "100vw",
    height: "100vh",
    backgroundColor: colors.background,
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
    padding: 0,
    boxSizing: "border-box",
    "@media (min-width: 1024px)": {
      padding: space["4"],
    },
  },
});

type ShellWrapperProps = {
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ShellWrapper({ style, children }: ShellWrapperProps) {
  return <div {...stylex.props(styles.base, effects.grain, style)}>{children}</div>;
}
