import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { intentBorders, intentFills } from "../foundations/surface.stylex";
import { disabledStyle } from "../intents/disabled.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { shadows, shadowColor } from "../tokens/shadows.stylex";
import { interaction } from "../consts/interaction.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

type SliderProps = {
  label?: string;
  variant?: keyof typeof intentFills;
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
    height: controls.sliderThumbSize,
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
    height: controls.sliderTrackHeight,
    borderRadius: radius.full,
    backgroundColor: colorVariants.mutedBg,
    // Recessed groove (self-tinted by the muted fill): the unfilled rail reads
    // as hollow, the progress fill as raised on top of it.
    [shadowColor.color]: colorVariants.mutedBg,
    boxShadow: shadows.sunken,
  },

  fill: (progress: string) => ({
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: progress,
    height: controls.sliderTrackHeight,
    borderRadius: radius.full,
  }),

  thumb: (progress: string) => ({
    position: "absolute",
    left: progress,
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: controls.sliderThumbSize,
    height: controls.sliderThumbSize,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    // Harmonic variant language: `intentBorders[variant]` seeds the shadow
    // tint, so the knob's resting cast follows its family (border + shadow
    // agree), per the "shadow paints itself" rule — the knob filler stays the
    // neutral `background` while its ring and halo carry the color.
    boxShadow: shadows.rest,
  }),

  input: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    cursor: interaction.cursorPointer,
  },

  value: {
    minWidth: space["10"],
    textAlign: "right",
  },
});

// Fill and thumb slices come from the shared surfaces (muted = muted.fg,
// S8: the signal sits on the muted track, is not a saturated fill).

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

      <div {...stylex.props(styles.container, disabled ? disabledStyle.base : null, style)}>
        <div {...stylex.props(styles.track)} />
        <div {...stylex.props(styles.fill(progress), intentFills[variant])} />
        <div {...stylex.props(styles.thumb(progress), intentBorders[variant])} />

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
