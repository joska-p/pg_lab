import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    margin: 0,
    maxWidth: "62ch",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightNormal,
  },
});

const toneVariants = stylex.create({
  default: {
    color: colors.foreground,
  },
  muted: {
    color: colors.mutedForeground,
  },
});

type TextProps = {
  tone?: keyof typeof toneVariants;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Text({ tone = "default", style, children }: TextProps) {
  return <p {...stylex.props(styles.base, toneVariants[tone], style)}>{children}</p>;
}
