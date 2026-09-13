import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { primitives } from "../primitives/interactive.stylex.ts";
import { colors, radius, space } from "../theme/tokens.stylex.ts";

type SliderProps = {
  label?: string;
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
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
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
    backgroundColor: colors.primary,
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

export function Slider(props: SliderProps) {
  const {
    label,
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
        <label htmlFor={controlId} {...stylex.props(primitives.label)}>
          {label}
        </label>
      ) : null}

      <div {...stylex.props(styles.container, disabled ? primitives.disabled : null, style)}>
        <div {...stylex.props(styles.track)} />
        <div {...stylex.props(styles.fill(progress))} />
        <div {...stylex.props(styles.thumb(progress))} />

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
          {...stylex.props(styles.input)}
        />
      </div>

      <output htmlFor={controlId} {...stylex.props(styles.value, primitives.value)}>
        {current.toFixed(precision)}
      </output>
    </div>
  );
}
