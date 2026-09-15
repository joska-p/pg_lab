import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { field } from "../foundations/field.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { Led } from "./Led";
import { Badge } from "./Badge";
import { families, type FamilyName } from "../tokens/families.stylex";

type TextInputProps = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

export function TextInput(props: TextInputProps) {
  const {
    label,
    family,
    live = false,
    value,
    defaultValue = "",
    placeholder,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const fam = family ? families[family] : null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div {...stylex.props(field.col, style)}>
      {label || family ? (
        <div {...stylex.props(field.labelRow)}>
          {fam ? <Led color={fam.base} live={live} /> : null}
          {family ? <Badge family={family}>{family}</Badge> : null}
          {label ? (
            <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
              {label}
            </label>
          ) : null}
        </div>
      ) : null}

      <input
        id={controlId}
        type="text"
        value={current}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        {...stylex.props(field.well, fieldText.value, disabled ? disabledStyle.base : null)}
      />
    </div>
  );
}
