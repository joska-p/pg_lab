import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    paddingBlock: 2,
    paddingInline: space["2"],
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
});

const variants = stylex.create({
  neutral: {},
  primary: {
    color: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    color: colors.secondary,
    borderColor: colors.secondary,
  },
  accent: {
    color: colors.accent,
    borderColor: colors.accent,
  },
  warning: {
    color: colors.warning,
    borderColor: colors.warning,
  },
  destructive: {
    color: colors.destructive,
    borderColor: colors.destructive,
  },
  muted: {
    color: colors.mutedForeground,
    borderColor: colors.mutedForeground,
  },
});

type BadgeProps = {
  variant?: keyof typeof variants;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Badge({ variant = "neutral", style, children }: BadgeProps) {
  return <span {...stylex.props(styles.base, variants[variant], style)}>{children}</span>;
}
