import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { interactive } from "../behaviors/interactive.stylex.ts";
import { fieldText } from "../behaviors/text.stylex.ts";
import { colors } from "../theme/tokens.stylex.ts";
import { radius, space } from "../theme/consts.stylex.ts";

type SliderProps = {
  label?: string;
  variant?: keyof typeof fillVariants;
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  id?: string;
  style?: StyleXStyles;
};

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 14;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function decimals(step: number) {
  if (Number.isInteger(step)) return 0;
  return (
    step
      .toFixed(10)
      .replace(/\.?0+$/, "")
      .split(".")[1]?.length ?? 0
  );
}

const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  container: {
    position: "relative",
    flex: 1,
    height: THUMB_SIZE,
    // The ring lives on the container (the input is opacity: 0, so its own
    // shadow would be invisible) but only shows for keyboard focus: mouse
    // clicks focus the input without matching :focus-visible.
    boxShadow: {
      default: null,
      [stylex.when.descendant(":focus-visible")]:
        `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },

  track: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
  },

  fill: (progress: string) => ({
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: progress,
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
  }),

  thumb: (progress: string) => ({
    position: "absolute",
    left: progress,
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    boxShadow: "0 1px 2px oklch(0% 0 0 / 30%)",
  }),

  input: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    cursor: "pointer",
  },

  value: {
    minWidth: space["10"],
    textAlign: "right",
  },
});

const fillVariants = stylex.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
  // Muted has no saturated fill: like Toggle's knob, the signal uses the
  // foreground token so progress stays readable on the muted track.
  muted: {
    backgroundColor: colors.mutedForeground,
  },
});

const thumbVariants = stylex.create({
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
    borderColor: colors.mutedForeground,
  },
});

export function Slider(props: SliderProps) {
  const {
    label,
    variant = "primary",
    min,
    max,
    step = 1,
    value,
    defaultValue = min,
    onValueChange,
    disabled,
    id: idProp,
    style,
  } = props;

  const id = useId();
  const controlId = idProp ?? id;
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = clamp(isControlled ? value : internal, min, max);
  const precision = decimals(step);
  const progress = `${((current - min) / (max - min)) * 100}%`;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = clamp(Number(event.currentTarget.value), min, max);
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div {...stylex.props(styles.row)}>
      {label ? (
        <label htmlFor={controlId} {...stylex.props(fieldText.label)}>
          {label}
        </label>
      ) : null}

      <div {...stylex.props(styles.container, disabled ? interactive.disabled : null, style)}>
        <div {...stylex.props(styles.track)} />
        <div {...stylex.props(styles.fill(progress), fillVariants[variant])} />
        <div {...stylex.props(styles.thumb(progress), thumbVariants[variant])} />

        <input
          id={controlId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          {...stylex.props(styles.input, stylex.defaultMarker())}
        />
      </div>

      <output htmlFor={controlId} {...stylex.props(styles.value, fieldText.value)}>
        {current.toFixed(precision)}
      </output>
    </div>
  );
}
