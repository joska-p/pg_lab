import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { colors } from "../theme/tokens.stylex";
import { radius, space } from "../theme/consts.stylex";

type ColorFieldProps = {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

function asHex(value: string) {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
  return "#000000";
}

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  input: {
    flexShrink: 0,
    width: 36,
    height: 26,
    margin: 0,
    padding: 2,
    borderRadius: radius.sm,
    borderWidth: "1px",
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
    defaultValue = "#000000",
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
          interactive.base,
          interactive.focusRing,
          disabled ? interactive.disabled : null,
          style,
        )}
      />

      <span {...stylex.props(styles.value, fieldText.value)}>{current.toUpperCase()}</span>
    </div>
  );
}
