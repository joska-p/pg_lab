import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { fieldFocus } from "../behaviors/intents.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, radius, space } from "../theme/consts.stylex";

type TextAreaProps = {
  label?: string;
  variant?: keyof typeof fieldFocus;
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
    resize: "vertical",
  },
});

export function TextArea(props: TextAreaProps) {
  const {
    label,
    variant = "primary",
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
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
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

      <textarea
        id={controlId}
        rows={rows}
        value={current}
        placeholder={placeholder}
        onChange={handleChange}
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
