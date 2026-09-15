import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { intentBorders, intentFills } from "../foundations/surface.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type RadioOption<T extends string> = {
  value: T;
  label?: string;
};

type RadioGroupProps<T extends string> = {
  label?: string;
  variant?: keyof typeof intentFills;
  options: readonly T[] | readonly RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const styles = stylex.create({
  row: {
    display: "flex",
    gap: space["3"],
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    flex: 1,
    minWidth: 0,
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    minHeight: controls.radioOptionMinHeight,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: colors.foreground,
    textAlign: "start",
  },

  circle: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: controls.radioCircleSize,
    height: controls.radioCircleSize,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colorVariants.mutedBg,
  },

  dot: {
    width: controls.radioDotSize,
    height: controls.radioDotSize,
    borderRadius: radius.full,
  },
});

export function RadioGroup<T extends string>(props: RadioGroupProps<T>) {
  const {
    label,
    variant = "primary",
    options,
    value,
    defaultValue,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const groupId = idProp ?? id;
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const items = options.map((option) => (typeof option === "string" ? { value: option } : option));
  const current = isControlled ? value : (internal ?? items[0].value);
  const listRef = useRef<HTMLDivElement>(null);

  function commit(next: T) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((option) => option.value === current);
    const last = items.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      nextIndex = index >= last ? 0 : index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      nextIndex = index <= 0 ? last : index - 1;
    else return;

    event.preventDefault();
    commit(items[nextIndex].value);
    (listRef.current?.children[nextIndex] as HTMLElement | undefined)?.focus();
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <span id={groupId} {...stylex.props(fieldText.label)}>
          {label}
        </span>
      ) : null}

      <div
        ref={listRef}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-label={label ? undefined : "choice"}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.options, disabled ? disabledStyle.base : null, style)}
      >
        {items.map((option) => {
          const chosen = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => commit(option.value)}
              disabled={disabled}
              {...stylex.props(
                styles.option,
                fieldText.value,
                interactiveBase.base,
                focusRing.base,
              )}
            >
              <span {...stylex.props(styles.circle, chosen ? intentBorders[variant] : null)}>
                {chosen ? <span {...stylex.props(styles.dot, intentFills[variant])} /> : null}
              </span>
              {option.label ?? option.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
