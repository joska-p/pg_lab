import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { field } from "../recipes/fields.stylex";
import { disabled as disabledRecipe } from "../recipes/interaction.stylex";
import { fieldText } from "../recipes/typography.stylex";
import { Led } from "./Led";

type NumberFieldProps = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

export function NumberField(props: NumberFieldProps) {
  const {
    label,
    family,
    live = false,
    invalid = false,
    errorMessage,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    value,
    defaultValue = 0,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const messageId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const [clampNotice, setClampNotice] = useState<string | null>(null);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const fam = family ? families[family] : null;
  const isClamped = clampNotice !== null;

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== next) {
      const bound = next < min ? "minimum" : "maximum";
      setClampNotice(`value clamped to ${clamped} (${bound})`);
    } else {
      setClampNotice(null);
    }
    if (!isControlled) setInternal(clamped);
    onValueChange?.(clamped);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    setDraft(raw);
    const parsed = Number(raw);
    if (raw !== "" && !Number.isNaN(parsed)) commit(parsed);
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

      <input
        id={controlId}
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(current)}
        onChange={handleChange}
        onBlur={() => {
          setDraft(null);
          setClampNotice(null);
        }}
        disabled={disabled}
        aria-invalid={invalid || isClamped || undefined}
        aria-describedby={errorMessage || clampNotice ? messageId : undefined}
        {...stylex.props(
          field.well,
          fieldText.value,
          invalid || isClamped ? field.wellInvalid : null,
          disabled ? disabledRecipe.base : null,
        )}
      />

      {errorMessage || clampNotice ? (
        <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
          {errorMessage ?? clampNotice}
        </span>
      ) : null}
    </div>
  );
}
