import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { interactive } from "../primitives/interactive.stylex.ts";
import { motion } from "../theme/consts.stylex.ts";
import { effects } from "../theme/effects.stylex.ts";
import { shadowColor } from "../theme/shadows.stylex.ts";
import { colors, radius, space, typography } from "../theme/tokens.stylex.ts";

const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  base: {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
    paddingBlock: space["2"],
    paddingInline: space["4"],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: "solid",
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightTight,
    transform: {
      default: null,
      ":active": "scale(0.98)",
    },
  },

  loading: {
    cursor: "progress",
  },

  spinner: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: radius.full,
    animationName: spin,
    animationDuration: motion.durationSlow,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});

const colorVariants = stylex.create({
  primary: {
    [shadowColor.color]: colors.primary,
    backgroundColor: {
      default: colors.primary,
      ":hover": colors.primaryHover,
    },
    borderColor: colors.primary,
    color: colors.primaryForeground,
  },

  secondary: {
    [shadowColor.color]: colors.secondary,
    backgroundColor: {
      default: colors.secondary,
      ":hover": colors.secondaryHover,
    },
    borderColor: colors.secondary,
    color: colors.secondaryForeground,
  },

  accent: {
    [shadowColor.color]: colors.accent,
    backgroundColor: {
      default: colors.accent,
      ":hover": colors.accentHover,
    },
    borderColor: colors.accent,
    color: colors.accentForeground,
  },

  warning: {
    [shadowColor.color]: colors.warning,
    backgroundColor: {
      default: colors.warning,
      ":hover": colors.warningHover,
    },
    borderColor: colors.warning,
    color: colors.warningForeground,
  },

  destructive: {
    [shadowColor.color]: colors.destructive,
    backgroundColor: {
      default: colors.destructive,
      ":hover": colors.destructiveHover,
    },
    borderColor: colors.destructive,
    color: colors.destructiveForeground,
  },

  muted: {
    [shadowColor.color]: colors.muted,
    backgroundColor: {
      default: colors.muted,
      ":hover": colors.mutedHover,
    },
    borderColor: colors.muted,
    color: colors.mutedForeground,
  },
});

type ButtonProps = {
  variant?: keyof typeof colorVariants;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleXStyles;
} & Omit<React.ComponentProps<"button">, "style">;

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      {...stylex.props(
        styles.base,
        colorVariants[variant],
        interactive.base,
        interactive.focusRing,
        effects.pressable,
        isDisabled ? interactive.disabled : null,
        loading ? styles.loading : null,
        style,
      )}
    >
      {loading ? <span aria-hidden {...stylex.props(styles.spinner)} /> : null}
      {children}
    </button>
  );
}
