import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex.ts";
import { fieldText } from "../behaviors/text.stylex.ts";
import { colors } from "../theme/tokens.stylex.ts";
import { radius, space } from "../theme/consts.stylex.ts";

type SegmentOption<T extends string> = {
  value: T;
  label?: string;
};

type SegmentedProps<T extends string> = {
  label?: string;
  variant?: keyof typeof chosenVariants;
  options: readonly T[] | readonly SegmentOption<T>[];
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
    alignItems: "center",
    gap: space["3"],
    flexWrap: "wrap",
  },

  group: {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: space["1"],
    padding: space["1"],
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },

  option: {
    padding: `1px ${space["3"]}`,
    borderRadius: radius.sm,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colors.mutedForeground,
  },
});

const chosenVariants = stylex.create({
  primary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  secondary: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
  },
  accent: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  warning: {
    borderColor: colors.warning,
    backgroundColor: colors.warning,
    color: colors.warningForeground,
  },
  destructive: {
    borderColor: colors.destructive,
    backgroundColor: colors.destructive,
    color: colors.destructiveForeground,
  },
  // Muted carries no fill color of its own: like Toggle's OFF state, the
  // signal goes through the border + brighter text instead of a fill that
  // would blend into the muted group background.
  muted: {
    borderColor: colors.mutedForeground,
    backgroundColor: "transparent",
    color: colors.foreground,
  },
});

export function Segmented<T extends string>(props: SegmentedProps<T>) {
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
  const groupRef = useRef<HTMLDivElement>(null);

  function commit(next: T) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((option) => option.value === current);
    const last = items.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = index >= last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") nextIndex = index <= 0 ? last : index - 1;
    else return;

    event.preventDefault();
    commit(items[nextIndex].value);
    (groupRef.current?.children[nextIndex] as HTMLElement | undefined)?.focus();
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <label id={groupId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-label={label ? undefined : "selection"}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.group, disabled ? interactive.disabled : null, style)}
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
                chosen ? chosenVariants[variant] : null,
                interactive.base,
                interactive.focusRing,
                disabled ? interactive.disabled : null,
              )}
            >
              {option.label ?? option.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
