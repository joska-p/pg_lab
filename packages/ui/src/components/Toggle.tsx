import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { glow } from "../effects/glow.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { active as activeIntent } from "../intents/active.stylex";
import { colors } from "../tokens/colors.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { motion } from "../consts/motion.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";

type ToggleProps = {
  label?: string;
  family?: FamilyName;
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
    width: "34px",
    height: "20px",
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },

  knob: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "14px",
    height: "14px",
    borderRadius: radius.full,
    backgroundColor: colors.background,
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "transform, background-color",
  },

  knobOn: {
    transform: "translateX(16px)",
  },
});

export function Toggle(props: ToggleProps) {
  const {
    label,
    family,
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
  const fam = family ? families[family] : null;

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
          isOn && fam ? activeIntent.fill(fam.base) : null,
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
            isOn ? activeIntent.knob : null,
          )}
        />
      </button>
    </div>
  );
}
