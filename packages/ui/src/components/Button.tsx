import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { colorIntents } from "../foundations/surface.stylex";
import { intentHovers } from "../intents/hover.stylex";
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
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightTight,
    transform: {
      default: null,
      ":active": `scale(${interaction.pressScale})`,
    },
  },

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
});

type ButtonProps = {
  variant?: keyof typeof colorIntents;
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
        colorIntents[variant],
        intentHovers[variant],
        interactiveBase.base,
        focusRing.base,
        pressable.base,
        isDisabled ? disabledStyle.base : null,
        loading ? styles.loading : null,
        style,
      )}
    >
      {loading ? <span aria-hidden {...stylex.props(styles.spinner)} /> : null}
      {children}
    </button>
  );
}
