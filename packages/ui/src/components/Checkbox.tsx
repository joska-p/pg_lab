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
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";

type CheckboxProps = {
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

  box: {
    position: "relative",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.checkboxSize,
    height: layout.checkboxSize,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },

  check: {
    width: layout.checkboxMarkSize,
    height: layout.checkboxMarkSize,
  },

  tint: (color: string) => ({
    [shadowColor.color]: color,
  }),
});

export function Checkbox(props: CheckboxProps) {
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
        role="checkbox"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={disabled}
        {...stylex.props(
          styles.box,
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
        {isOn ? (
          <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.check)}>
            <path
              d="M2 6.4 4.8 9 10 3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
    </div>
  );
}
