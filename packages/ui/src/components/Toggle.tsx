import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { colors } from "../theme/tokens.stylex";
import { motion, radius, space } from "../theme/consts.stylex";

type ToggleProps = {
  label?: string;
  variant?: keyof typeof trackOnVariants;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const TRACK_WIDTH = 34;
const TRACK_HEIGHT = 20;
const INSET = 2;
const KNOB_SIZE = 14;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - INSET * 2;

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },

  track: {
    position: "relative",
    flexShrink: 0,
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: {
      default: colors.muted,
      ":hover": colors.mutedHover,
    },
  },

  knob: {
    position: "absolute",
    top: INSET,
    left: INSET,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transitionProperty: "transform, background-color",
  },

  knobOn: {
    transform: `translateX(${KNOB_TRAVEL}px)`,
    backgroundColor: "currentColor",
  },
});

const trackOffVariants = stylex.create({
  primary: {
    borderColor: colors.primary,
  },
  secondary: {
    borderColor: colors.secondary,
  },
  accent: {
    borderColor: colors.accent,
  },
  warning: {
    borderColor: colors.warning,
  },
  destructive: {
    borderColor: colors.destructive,
  },
  muted: {
    borderColor: colors.muted,
  },
});

const trackOnVariants = stylex.create({
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
    borderColor: colors.muted,
    color: colors.mutedForeground,
    boxShadow: `0 0 6px ${colors.muted}`,
  },
});

export function Toggle(props: ToggleProps) {
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
        role="switch"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={disabled}
        {...stylex.props(
          styles.track,
          trackOffVariants[variant],
          isOn ? trackOnVariants[variant] : null,
          interactive.base,
          interactive.focusRing,
          disabled ? interactive.disabled : null,
          style,
        )}
      >
        <span {...stylex.props(styles.knob, isOn ? styles.knobOn : null)} />
      </button>
    </div>
  );
}
