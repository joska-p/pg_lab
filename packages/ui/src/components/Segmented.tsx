import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { primitives } from "../primitives/interactive.stylex.ts";
import { colors, radius, space } from "../theme/tokens.stylex.ts";

type SegmentOption<T extends string> = {
  value: T;
  label?: string;
};

type SegmentedProps<T extends string> = {
  label?: string;
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

  chosen: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
});

export function Segmented<T extends string>(props: SegmentedProps<T>) {
  const { label, options, value, defaultValue, onValueChange, disabled, id: idProp, style } = props;

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
        <label id={groupId} {...stylex.props(primitives.label)}>
          {label}
        </label>
      ) : null}

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-label={label ? undefined : "selection"}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.group, disabled ? primitives.disabled : null, style)}
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
                chosen ? styles.chosen : null,
                primitives.interactive,
                primitives.focusRing,
                disabled ? primitives.disabled : null,
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
