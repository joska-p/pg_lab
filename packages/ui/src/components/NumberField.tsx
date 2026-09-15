import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { field } from "../foundations/field.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { Led } from "./Led";
import { Badge } from "./Badge";
import { families, type FamilyName } from "../tokens/families.stylex";

type NumberFieldProps = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
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
  const [internal, setInternal] = useState(defaultValue);
  const [draft, setDraft] = useState<string | null>(null);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const fam = family ? families[family] : null;

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
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
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(current)}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
        disabled={disabled}
        {...stylex.props(field.well, fieldText.value, disabled ? disabledStyle.base : null)}
      />
    </div>
  );
}
