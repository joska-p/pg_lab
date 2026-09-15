import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { layout } from "../consts/layout.stylex";
import { typography } from "../consts/typography.stylex";

const styles = stylex.create({
  base: {
    margin: 0,
    maxWidth: layout.textMaxWidth,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightNormal,
  },
});

const variants = stylex.create({
  default: {
    color: colors.foreground,
  },
  muted: {
    color: colors.mutedForeground,
  },
});

type TextProps = {
  variant?: keyof typeof variants;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Text({ variant = "default", style, children }: TextProps) {
  return <p {...stylex.props(styles.base, variants[variant], style)}>{children}</p>;
}
