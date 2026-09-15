import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactiveBase } from "../foundations/interaction.stylex";
import { fieldText } from "../foundations/text.stylex";
import { colorIntents } from "../foundations/surface.stylex";
import { focusRing } from "../intents/focus.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type SegmentOption<T extends string> = {
  value: T;
  label?: string;
};

type SegmentedProps<T extends string> = {
  label?: string;
  variant?: keyof typeof colorIntents;
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
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colorVariants.mutedBg,
  },

  option: {
    padding: `${controls.segmentedPaddingBlock} ${space["3"]}`,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colorVariants.mutedFg,
  },

  // S8: the muted chip never fills — a fill would blend into the muted group
  // well. Signal goes through a `muted.fg` border + brighter text only,
  // overriding the canonical muted intent.
  chosenMuted: {
    borderColor: colorVariants.mutedFg,
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
        {...stylex.props(styles.group, disabled ? disabledStyle.base : null, style)}
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
                chosen ? colorIntents[variant] : null,
                variant === "muted" && chosen ? styles.chosenMuted : null,
                interactiveBase.base,
                focusRing.base,
                disabled ? disabledStyle.base : null,
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
