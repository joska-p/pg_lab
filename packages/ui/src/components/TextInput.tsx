import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { colors } from "../theme/tokens.stylex";
import { radius, space } from "../theme/consts.stylex";

type TextInputProps = {
  label?: string;
  variant?: keyof typeof focusVariants;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
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
    minWidth: 0,
  },

  input: {
    width: "100%",
    minWidth: 0,
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: colors.input,
    color: colors.foreground,
    outline: "none",
  },
});

const focusVariants = stylex.create({
  primary: {
    borderColor: { default: colors.border, ":focus": colors.primary },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.primary}`,
    },
  },
  secondary: {
    borderColor: { default: colors.border, ":focus": colors.secondary },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.secondary}`,
    },
  },
  accent: {
    borderColor: { default: colors.border, ":focus": colors.accent },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.accent}`,
    },
  },
  warning: {
    borderColor: { default: colors.border, ":focus": colors.warning },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.warning}`,
    },
  },
  destructive: {
    borderColor: { default: colors.border, ":focus": colors.destructive },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.destructive}`,
    },
  },
  muted: {
    borderColor: { default: colors.border, ":focus": colors.mutedForeground },
    boxShadow: {
      default: null,
      ":focus": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.mutedForeground}`,
    },
  },
});

export function TextInput(props: TextInputProps) {
  const {
    label,
    variant = "primary",
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
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
        type="text"
        value={current}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        {...stylex.props(
          styles.input,
          fieldText.value,
          focusVariants[variant],
          disabled ? interactive.disabled : null,
          style,
        )}
      />
    </div>
  );
}
