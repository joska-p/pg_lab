import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { colors } from "../theme/tokens.stylex";
import { radius, space } from "../theme/consts.stylex";

type CheckboxProps = {
  label?: string;
  variant?: keyof typeof boxOnVariants;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const BOX_SIZE = 18;

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },

  box: {
    position: "relative",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radius.sm,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: {
      default: colors.muted,
      ":hover": colors.mutedHover,
    },
  },

  check: {
    width: 12,
    height: 12,
  },
});

const boxOnVariants = stylex.create({
  primary: {
    backgroundColor: {
      default: colors.primary,
      ":hover": colors.primaryHover,
    },
    borderColor: colors.primary,
    color: colors.primaryForeground,
    boxShadow: `0 0 6px ${colors.primary}`,
  },
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      ":hover": colors.secondaryHover,
    },
    borderColor: colors.secondary,
    color: colors.secondaryForeground,
    boxShadow: `0 0 6px ${colors.secondary}`,
  },
  accent: {
    backgroundColor: {
      default: colors.accent,
      ":hover": colors.accentHover,
    },
    borderColor: colors.accent,
    color: colors.accentForeground,
    boxShadow: `0 0 6px ${colors.accent}`,
  },
  warning: {
    backgroundColor: {
      default: colors.warning,
      ":hover": colors.warningHover,
    },
    borderColor: colors.warning,
    color: colors.warningForeground,
    boxShadow: `0 0 6px ${colors.warning}`,
  },
  destructive: {
    backgroundColor: {
      default: colors.destructive,
      ":hover": colors.destructiveHover,
    },
    borderColor: colors.destructive,
    color: colors.destructiveForeground,
    boxShadow: `0 0 6px ${colors.destructive}`,
  },
  muted: {
    backgroundColor: {
      default: colors.muted,
      ":hover": colors.mutedHover,
    },
    borderColor: colors.mutedForeground,
    color: colors.foreground,
    boxShadow: `0 0 6px ${colors.muted}`,
  },
});

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    variant = "primary",
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : internal;

  function handleClick() {
    const next = !isOn;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <button
        id={controlId}
        type="button"
        role="checkbox"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={disabled}
        {...stylex.props(
          styles.box,
          isOn ? boxOnVariants[variant] : null,
          interactive.base,
          interactive.focusRing,
          disabled ? interactive.disabled : null,
          style,
        )}
      >
        {isOn ? (
          <svg viewBox="0 0 12 12" aria-hidden {...stylex.props(styles.check)}>
            {/* Common SVG finish (D2): 12px grid, 1.8 stroke, round caps —
                shared with the Select chevron. RadioGroup needs no SVG:
                its dot is a CSS circle. */}
            <path
              d="M2 6.4 4.8 9 10 3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
    </div>
  );
}
