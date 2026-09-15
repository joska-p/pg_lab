import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { colors } from "../tokens/colors.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    paddingBlock: controls.badgePaddingBlock,
    paddingInline: space["2"],
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colorVariants.mutedFg,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
});

// Outline chips: transparent fill, tint carried by the variant `border` slot
// (the hue) for both stroke and text. The muted family signals through its
// `fg` (Muted Ink).
const variants = stylex.create({
  neutral: {},
  primary: {
    color: colorVariants.primaryBorder,
    borderColor: colorVariants.primaryBorder,
  },
  secondary: {
    color: colorVariants.secondaryBorder,
    borderColor: colorVariants.secondaryBorder,
  },
  accent: {
    color: colorVariants.accentBorder,
    borderColor: colorVariants.accentBorder,
  },
  warning: {
    color: colorVariants.warningBorder,
    borderColor: colorVariants.warningBorder,
  },
  destructive: {
    color: colorVariants.destructiveBorder,
    borderColor: colorVariants.destructiveBorder,
  },
  muted: {
    color: colorVariants.mutedFg,
    borderColor: colorVariants.mutedFg,
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
