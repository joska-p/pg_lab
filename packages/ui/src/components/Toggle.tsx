import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex";
import { fieldText } from "../behaviors/text.stylex";
import { effects } from "../behaviors/effects.stylex";
import { colorIntents, intentBorders, intentHovers } from "../behaviors/intents.stylex";
import { colors } from "../theme/tokens.stylex";
import { borderWidth, motion, radius, space } from "../theme/consts.stylex";

type ToggleProps = {
  label?: string;
  variant?: keyof typeof colorIntents;
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
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: {
      default: colors.muted,
      ":hover": colors.mutedHover,
    },
  },

  // S8: the OFF border stays the neutral `muted` (a quiet recess), where the
  // shared `intentBorders` muted signals through `mutedForeground` for the
  // Slider/Radio marks. Composed only for the muted family.
  trackOffMuted: {
    borderColor: colors.muted,
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
          intentBorders[variant],
          variant === "muted" ? styles.trackOffMuted : null,
          isOn ? colorIntents[variant] : null,
          isOn ? intentHovers[variant] : null,
          isOn ? effects.glowRing : null,
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
