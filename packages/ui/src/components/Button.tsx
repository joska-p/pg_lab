import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { pressable } from "../intents/pressable.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { motion } from "../consts/motion.stylex";
import { interaction } from "../consts/interaction.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";
import { colors } from "../tokens/colors.stylex";
import { shadowColor, shadows } from "../tokens/shadows.stylex";
import { families, type FamilyName } from "../consts/families.stylex";
import { Led } from "../intents/led.stylex";

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
    cursor: interaction.cursorPointer,
    transitionProperty: "background-color, border-color, box-shadow, transform",
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transform: {
      default: null,
      ":active": `scale(${interaction.pressScale})`,
    },
    ":hover": {
      boxShadow: shadows.hover,
    },
    ":active": {
      boxShadow: shadows.active,
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
    width: controls.spinnerSize,
    height: controls.spinnerSize,
    borderWidth: controls.spinnerBorderWidth,
    borderStyle: "solid",
    borderColor: "currentColor",
    borderTopColor: "transparent",
    borderRadius: radius.full,
    animationName: spin,
    animationDuration: motion.durationSlow,
    animationTimingFunction: motion.easingLinear,
    animationIterationCount: motion.iterationInfinite,
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
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const fam = family ? families[family] : null;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading}
      {...stylex.props(
        styles.base,
        fam ? styles.hover(fam.strong) : null,
        fam && live ? styles.live(fam.base) : null,
        lead ? styles.lead : null,
        interactiveBase.base,
        focusRing.base,
        pressable.base,
        isDisabled ? disabledStyle.base : null,
        loading ? styles.loading : null,
        style,
      )}
    >
      {loading ? (
        <span aria-hidden {...stylex.props(styles.spinner)} />
      ) : fam ? (
        <Led color={fam.base} live={live} />
      ) : null}
      {children}
    </button>
  );
}
