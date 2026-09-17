import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { field } from "../recipes/fields.stylex";
import { disabled as disabledRecipe } from "../recipes/interaction.stylex";
import { fieldText } from "../recipes/typography.stylex";
import { Led } from "./Led";

type TextAreaProps = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const styles = stylex.create({
  input: {
    resize: "vertical",
  },
});

export function TextArea(props: TextAreaProps) {
  const {
    label,
    family,
    live = false,
    invalid = false,
    errorMessage,
    rows = 3,
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
  const messageId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const fam = family ? families[family] : null;

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div {...stylex.props(field.col, style)}>
      {label || fam ? (
        <div {...stylex.props(field.labelRow)}>
          {family ? <Led color={family} live={live} /> : null}
          {label ? (
            <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
              {label}
            </label>
          ) : null}
        </div>
      ) : null}

      <textarea
        id={controlId}
        rows={rows}
        value={current}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={errorMessage ? messageId : undefined}
        {...stylex.props(
          field.well,
          fieldText.value,
          styles.input,
          invalid ? field.wellInvalid : null,
          disabled ? disabledRecipe.base : null,
        )}
      />

      {errorMessage ? (
        <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
