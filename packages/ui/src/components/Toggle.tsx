import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { glow } from "../effects/glow.stylex";
import { intentBorders, intentFills } from "../foundations/surface.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { motion } from "../consts/motion.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type ToggleProps = {
  label?: string;
  variant?: keyof typeof intentFills;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },

  track: {
    position: "relative",
    flexShrink: 0,
    width: controls.toggleWidth,
    height: controls.toggleHeight,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: {
      default: colorVariants.mutedBg,
      ":hover": colorVariants.mutedBgHover,
    },
  },

  // S8: the muted family keeps the neutral `muted` border (a quiet recess),
  // where the shared `intentBorders` muted signals through `muted.fg` for the
  // Slider/Radio marks. Composed only for the muted family.
  trackMuted: {
    borderColor: colorVariants.mutedBorder,
  },

  knob: {
    position: "absolute",
    top: controls.toggleInset,
    left: controls.toggleInset,
    width: controls.toggleKnobSize,
    height: controls.toggleKnobSize,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "transform, background-color",
  },

  knobOn: {
    transform: `translateX(${controls.toggleKnobTravel}px)`,
  },
});

export function Toggle(props: ToggleProps) {
  const {
    label,
    variant = "primary",
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internal;

  function handleClick() {
    const next = !isOn;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <button
        id={controlId}
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={disabled}
        {...stylex.props(
          styles.track,
          intentBorders[variant],
          variant === "muted" ? styles.trackMuted : null,
          isOn ? glow.glowRing : null,
          interactiveBase.base,
          focusRing.base,
          disabled ? disabledStyle.base : null,
          style,
        )}
      >
        <span
          {...stylex.props(
            styles.knob,
            isOn ? styles.knobOn : null,
            isOn ? intentFills[variant] : null,
          )}
        />
      </button>
    </div>
  );
}
