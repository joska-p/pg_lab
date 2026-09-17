import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { touch } from "../foundations/touch.stylex";
import { fieldText } from "../foundations/text.stylex";
import { glow } from "../effects/glow.stylex";
import { pressable } from "../intents/pressable.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { active as activeIntent } from "../intents/active.stylex";
import { colors } from "../tokens/colors.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { layout } from "../consts/layout.stylex";
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
    width: layout.toggleTrackWidth,
    height: layout.toggleTrackHeight,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },

  // The on-state fill tints the halo + cast through `shadowColor`, so the
  // Pilot Light follows the family (Shadow-Paints-Itself on a live key).
  tint: (color: string) => ({
    [shadowColor.color]: color,
  }),

  knob: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: layout.toggleKnobSize,
    height: layout.toggleKnobSize,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    transitionDuration: {
      default: motion.durationFast,
      "@media (prefers-reduced-motion: reduce)": "1ms",
    },
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "transform, background-color",
  },

  knobOn: {
    transform: `translateX(${layout.toggleKnobTravel})`,
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
  // Identity-less on state answers with the contact hue (DESIGN: Rails —
  // parameters without an identity take the contact hue). The halo + lift
  // follow via shadowColor (Shadow-Paints-Itself on a live key).
  const onFill = fam ? fam.base : colors.ring;

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
          isOn ? activeIntent.fill(onFill) : null,
          isOn ? styles.tint(onFill) : null,
          isOn ? glow.glowWithPress : null,
          interactiveBase.base,
          !isOn ? pressable.base : null,
          disabled ? disabledStyle.base : null,
          style,
        )}
      >
        <span aria-hidden {...stylex.props(touch.hit)} />
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
