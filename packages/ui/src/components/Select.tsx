import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { field } from "../foundations/field.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { Led } from "../intents/led.stylex";
import { Badge } from "./Badge";
import { families, type FamilyName } from "../consts/families.stylex";
import { colors } from "../tokens/colors.stylex";
import { interaction } from "../consts/interaction.stylex";
import { space } from "../consts/spacing.stylex";
import { controls } from "../consts/controls.stylex";

type SelectOption<T extends string> = {
  value: T;
  label?: string;
};

type SelectProps<T extends string> = {
  label?: string;
  family?: FamilyName;
  live?: boolean;
  options: readonly T[] | readonly SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const styles = stylex.create({
  wrap: {
    position: "relative",
    display: "flex",
    flex: 1,
    minWidth: 0,
  },

  select: {
    appearance: "none",
    width: "100%",
    minWidth: 0,
    margin: 0,
    paddingBlock: space["2"],
    paddingLeft: space["3"],
    paddingRight: space["8"],
    backgroundColor: colors.input,
    color: colors.foreground,
    outline: "none",
    cursor: interaction.cursorPointer,
  },

  chevron: {
    position: "absolute",
    right: space["3"],
    top: "50%",
    transform: "translateY(-50%)",
    width: controls.chevronSize,
    height: controls.chevronSize,
    color: colors.mutedForeground,
    pointerEvents: "none",
  },
});

export function Select<T extends string>(props: SelectProps<T>) {
  const {
    label,
    family,
    live = false,
    options,
    value,
    defaultValue,
    placeholder,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(
    defaultValue ?? (placeholder ? undefined : items0(options)),
  );
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const fam = family ? families[family] : null;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.currentTarget.value as T;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  const items = options.map((option) => (typeof option === "string" ? { value: option } : option));

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

      <div {...stylex.props(styles.wrap)}>
        <select
          id={controlId}
          value={current ?? ""}
          onChange={handleChange}
          disabled={disabled}
          {...stylex.props(
            field.well,
            styles.select,
            fieldText.value,
            disabled ? disabledStyle.base : null,
          )}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {items.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label ?? option.value}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.chevron)}>
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={controls.chevronStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function items0<T extends string>(options: readonly T[] | readonly SelectOption<T>[]): T {
  const first = options[0];
  return typeof first === "string" ? first : first.value;
}
