import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { fieldFocus } from "../behaviors/intents.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

type SelectOption<T extends string> = {
  value: T;
  label?: string;
};

type SelectProps<T extends string> = {
  label?: string;
  variant?: keyof typeof fieldFocus;
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
  field: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    flex: 1,
    minWidth: "fit-content",
  },

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
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    backgroundColor: colors.input,
    color: colors.foreground,
    outline: "none",
    cursor: "pointer",
  },

  chevron: {
    position: "absolute",
    right: space["3"],
    top: "50%",
    transform: "translateY(-50%)",
    width: 12,
    height: 12,
    color: colors.mutedForeground,
    pointerEvents: "none",
  },
});

export function Select<T extends string>(props: SelectProps<T>) {
  const {
    label,
    variant = "primary",
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

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.currentTarget.value as T;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  const items = options.map((option) => (typeof option === "string" ? { value: option } : option));

  return (
    <div {...stylex.props(styles.field)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <div {...stylex.props(styles.wrap)}>
        <select
          id={controlId}
          value={current ?? ""}
          onChange={handleChange}
          disabled={disabled}
          {...stylex.props(
            styles.select,
            fieldText.value,
            fieldFocus[variant],
            disabled ? interactive.disabled : null,
            style,
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
            strokeWidth={1.8}
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
