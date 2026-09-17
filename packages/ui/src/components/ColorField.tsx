import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { field } from "../foundations/field.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { layout } from "../consts/layout.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { Led } from "./Led";

type ColorFieldProps = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
  invalid?: boolean;
  errorMessage?: string;
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
    width: layout.colorSwatchWidth,
    height: layout.colorSwatchHeight,
    margin: 0,
    padding: layout.colorSwatchPad,
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
    family,
    live = false,
    invalid = false,
    errorMessage,
    value,
    defaultValue = DEFAULT_HEX,
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
  const current = asHex(isControlled ? value : internal);
  const fam = family ? families[family] : null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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

      <div {...stylex.props(styles.row)}>
        <input
          id={controlId}
          type="color"
          value={current}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={errorMessage ? messageId : undefined}
          {...stylex.props(
            styles.input,
            interactiveBase.base,
            focusRing.base,
            invalid ? field.wellInvalid : null,
            disabled ? disabledStyle.base : null,
          )}
        />

        <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
          {current.toUpperCase()}
        </output>
      </div>

      {errorMessage ? (
        <span id={messageId} role="alert" {...stylex.props(fieldText.message)}>
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
