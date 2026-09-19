import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { borderWidth, interaction, layout, radius, space } from "../tokens/layout.stylex";
import { motion } from "../tokens/motion.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { typography } from "../tokens/typography.stylex";
import { disabled, interactive, pressable } from "../recipes/interaction.stylex";

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
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.foreground,
    [shadowColor.color]: colors.card,
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightTight,
    ":active": {
      transform: `scale(${interaction.pressScale})`,
    },
  },

  hover: (base: string, strong: string) => ({
    ":hover": {
      backgroundColor: `color-mix(in oklab, ${base} 42%, ${colors.card})`,
      borderColor: `color-mix(in oklab, ${strong} 75%, ${colors.border})`,
    },
  }),

  family: (base: string, strong: string) => ({
    backgroundColor: `color-mix(in oklab, ${base} 30%, ${colors.card})`,
    borderColor: `color-mix(in oklab, ${strong} 60%, ${colors.border})`,
  }),

  loading: {
    cursor: interaction.cursorProgress,
  },

  spinner: {
    width: layout.spinnerSize,
    height: layout.spinnerSize,
    borderWidth: layout.spinnerRingWidth,
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: radius.full,
    animationName: spin,
    animationDuration: motion.durationSlow,
    animationTimingFunction: motion.easingLinear,
    animationIterationCount: {
      default: motion.iterationInfinite,
      "@media (prefers-reduced-motion: reduce)": "1",
    },
  },
});

type ButtonProps = {
  family?: FamilyName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleXStyles;
} & Omit<React.ComponentProps<"button">, "style">;

export function Button({
  family,
  loading = false,
  disabled: disabledProp,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabledProp || loading;
  const fam = family ? families[family] : null;

  const buttonStyle = stylex.props(
    styles.base,
    interactive.base,
    pressable.base,
    fam ? styles.family(fam.base, fam.strong) : null,
    fam ? styles.hover(fam.base, fam.strong) : null,
    isDisabled ? disabled.base : null,
    loading ? styles.loading : null,
    style,
  );

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading}
      {...buttonStyle}
    >
      {loading && <span aria-hidden {...stylex.props(styles.spinner)} />}
      {children}
    </button>
  );
}
