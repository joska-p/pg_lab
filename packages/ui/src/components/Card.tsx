import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { elevation } from "../effects/elevation.stylex";
import { glass } from "../effects/glass.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
});

const variants = stylex.create({
  surface: {
    [shadowColor.color]: colors.card,
  },

  glass: {
    [shadowColor.color]: colors.card,
  },

  raised: {
    [shadowColor.color]: colors.card,
  },

  sunken: {
    [shadowColor.color]: colorVariants.mutedBg,
    backgroundColor: colorVariants.mutedBg,
    color: colorVariants.mutedFg,
  },
});

const variantEffects = {
  surface: null,
  glass: glass.glass,
  raised: elevation.raised,
  sunken: elevation.sunken,
} satisfies Record<keyof typeof variants, StyleXStyles | null>;

type CardProps = {
  variant?: keyof typeof variants;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Card({ variant = "surface", style, children }: CardProps) {
  return (
    <div {...stylex.props(styles.base, variants[variant], variantEffects[variant], style)}>
      {children}
    </div>
  );
}
