import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { glow } from "../effects/glow.stylex";
import { colorIntents } from "../foundations/surface.stylex";
import { intentHovers } from "../intents/hover.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type CheckboxProps = {
  label?: string;
  variant?: keyof typeof colorIntents;
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
    width: controls.checkboxSize,
    height: controls.checkboxSize,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: {
      default: colorVariants.mutedBg,
      ":hover": colorVariants.mutedBgHover,
    },
  },

  check: {
    width: controls.checkboxGlyph,
    height: controls.checkboxGlyph,
  },

  // S8: the checked muted box keeps its muted fill but signals through a
  // `muted.fg` border and plain foreground, matching how the Segmented
  // muted chip reads — unlike the canonical `colorIntents` whose muted border
  // and foreground are `muted` / `fg`.
  boxOnMuted: {
    borderColor: colorVariants.mutedFg,
    color: colors.foreground,
  },
});

export function Checkbox(props: CheckboxProps) {
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
        role="checkbox"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={disabled}
        {...stylex.props(
          styles.box,
          isOn ? colorIntents[variant] : null,
          isOn ? intentHovers[variant] : null,
          isOn ? glow.glowRing : null,
          variant === "muted" && isOn ? styles.boxOnMuted : null,
          interactiveBase.base,
          focusRing.base,
          disabled ? disabledStyle.base : null,
          style,
        )}
      >
        {isOn ? (
          <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.check)}>
            {/* Common SVG finish (D2): 12px grid, 1.8 stroke, round caps —
                shared with the Select chevron. RadioGroup needs no SVG:
                its dot is a CSS circle. */}
            <path
              d="M2 6.4 4.8 9 10 3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth={controls.checkboxStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
    </div>
  );
}
