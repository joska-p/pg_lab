import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { familiesConsts, type FamilyName } from "../tokens/families.stylex";
import { borderWidth, layout, radius, space } from "../tokens/layout.stylex";
import { shadows } from "../tokens/shadows.stylex";
import { disabled as disabledRecipe, focusRing, interactive } from "../recipes/interaction.stylex";
import { fieldText } from "../recipes/typography.stylex";

type RadioOption<T extends string> = {
  value: T;
  label?: string;
};

type RadioGroupProps<T extends string> = {
  label?: string;
  family?: FamilyName;
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
    minHeight: layout.radioOptionMinHeight,
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
    width: layout.radioCircleSize,
    height: layout.radioCircleSize,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.muted,
    boxShadow: shadows.sunken,
  },

  dot: {
    width: layout.radioDotSize,
    height: layout.radioDotSize,
    borderRadius: radius.full,
    backgroundColor: colors.foreground,
  },
});

const circleChosenVariants = stylex.create({
  aurora: {
    backgroundColor: familiesConsts.auroraBase,
    borderColor: familiesConsts.auroraBase,
  },
  solder: {
    backgroundColor: familiesConsts.solderBase,
    borderColor: familiesConsts.solderBase,
  },
  "neon-violet": {
    backgroundColor: familiesConsts.neonVioletBase,
    borderColor: familiesConsts.neonVioletBase,
  },
  amber: {
    backgroundColor: familiesConsts.amberBase,
    borderColor: familiesConsts.amberBase,
  },
  error: {
    backgroundColor: familiesConsts.errorBase,
    borderColor: familiesConsts.errorBase,
  },
  aqua: {
    backgroundColor: familiesConsts.aquaBase,
    borderColor: familiesConsts.aquaBase,
  },
  orange: {
    backgroundColor: familiesConsts.orangeBase,
    borderColor: familiesConsts.orangeBase,
  },
});

export function RadioGroup<T extends string>(props: RadioGroupProps<T>) {
  const {
    label,
    family,
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
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = last;
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
        {...stylex.props(styles.options, disabled ? disabledRecipe.base : null, style)}
      >
        {items.map((option) => {
          const chosen = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={chosen}
              tabIndex={chosen ? 0 : -1}
              onClick={() => commit(option.value)}
              disabled={disabled}
              {...stylex.props(
                styles.option,
                fieldText.value,
                interactive.base,
                focusRing.base,
                disabled ? disabledRecipe.base : null,
              )}
            >
              <span
                {...stylex.props(
                  styles.circle,
                  chosen && family ? circleChosenVariants[family] : null,
                )}
              >
                {chosen ? <span {...stylex.props(styles.dot)} /> : null}
              </span>

              {option.label ?? option.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
