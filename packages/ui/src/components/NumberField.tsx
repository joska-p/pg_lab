import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { fieldFocus } from "../behaviors/intents.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

type NumberFieldProps = {
  label?: string;
  variant?: keyof typeof fieldFocus;
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

const styles = stylex.create({
  field: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    flex: 1,
    minWidth: "fit-content",
  },

  input: {
    width: "100%",
    minWidth: 0,
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    backgroundColor: colors.input,
    color: colors.foreground,
    outline: "none",
  },
});

export function NumberField(props: NumberFieldProps) {
  const {
    label,
    variant = "primary",
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
    <div {...stylex.props(styles.field)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
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
        {...stylex.props(
          styles.input,
          fieldText.value,
          fieldFocus[variant],
          disabled ? interactive.disabled : null,
          style,
        )}
      />
    </div>
  );
}
