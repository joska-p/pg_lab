import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { interactive } from "../primitives/interactive.stylex.ts";
import { fieldText } from "../primitives/text.stylex.ts";
import { colors, radius, space } from "../theme/tokens.stylex.ts";

type ToggleProps = {
  label?: string;
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
      ":hover": colors.border,
    },
  },

  trackOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    boxShadow: `0 0 6px ${colors.primary}`,
  },

  knob: {
    position: "absolute",
    top: INSET,
    left: INSET,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    transitionDuration: "120ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionProperty: "transform, background-color",
  },

  knobOn: {
    transform: `translateX(${KNOB_TRAVEL}px)`,
    backgroundColor: colors.primaryForeground,
  },
});

export function Toggle(props: ToggleProps) {
  const {
    label,
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
          isOn ? styles.trackOn : null,
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
