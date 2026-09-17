import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { borderWidth, interaction, layout, radius, space } from "../tokens/layout.stylex";
import { motion } from "../tokens/motion.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { typography } from "../tokens/typography.stylex";
import { disabled, interactive, pressable } from "../recipes/interaction.stylex";
import { Led } from "./Led";

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

  hover: (strong: string) => ({
    ":hover": {
      backgroundColor: `color-mix(in oklab, ${colors.card} 86%, ${strong})`,
      borderColor: `color-mix(in oklab, ${strong} 55%, ${colors.border})`,
    },
  }),

  live: (base: string) => ({
    backgroundColor: `color-mix(in oklab, ${base} 12%, ${colors.card})`,
    borderColor: `color-mix(in oklab, ${base} 50%, ${colors.border})`,
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

  lead: {
    paddingInline: space["4"],
    fontWeight: typography.fontWeightSemibold,
  },
});

type ButtonProps = {
  family?: FamilyName;
  live?: boolean;
  lead?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleXStyles;
} & Omit<React.ComponentProps<"button">, "style">;

export function Button({
  family,
  live = false,
  lead = false,
  loading = false,
  disabled: disabledProp,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabledProp || loading;
  const fam = family ? families[family] : null;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading}
      {...stylex.props(
        styles.base,
        interactive.base,
        pressable.base,
        fam ? styles.hover(fam.strong) : null,
        fam && live ? styles.live(fam.base) : null,
        lead ? styles.lead : null,
        isDisabled ? disabled.base : null,
        loading ? styles.loading : null,
        style,
      )}
    >
      {loading ? (
        <span aria-hidden {...stylex.props(styles.spinner)} />
      ) : family ? (
        <Led color={family} live={live} />
      ) : null}
      {children}
    </button>
  );
}
