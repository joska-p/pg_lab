import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type ColorFieldProps = {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const DEFAULT_HEX = "#000000";

function asHex(value: string) {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
  return DEFAULT_HEX;
}

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  input: {
    flexShrink: 0,
    width: "36px",
    height: "26px",
    margin: 0,
    padding: "2px",
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  value: {
    minWidth: space["10"],
  },
});

export function ColorField(props: ColorFieldProps) {
  const {
    label,
    value,
    defaultValue = DEFAULT_HEX,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = asHex(isControlled ? value : internal);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <input
        id={controlId}
        type="color"
        value={current}
        onChange={handleChange}
        disabled={disabled}
        {...stylex.props(
          styles.input,
          interactiveBase.base,
          focusRing.base,
          disabled ? disabledStyle.base : null,
          style,
        )}
      />

      <span {...stylex.props(styles.value, fieldText.value)}>{current.toUpperCase()}</span>
    </div>
  );
}
