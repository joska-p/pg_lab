import * as stylex from "@stylexjs/stylex";

// Widget geometry (non-themable, fixed control dimensions). Values were moved
// out of component modules so no size literal lives below the consts layer.
// CSS lengths carry their unit ("px"); JS code that needs a plain number
// parses it (see Toggle's KNOB_TRAVEL).
export const controls = stylex.defineConsts({
  // Loading spinner (Button).
  spinnerSize: "12px",
  spinnerBorderWidth: "2px",

  // Badge outline pill.
  badgePaddingBlock: "2px",

  // Toggle track/knob — KNOB travel is derived: width − knob − inset·2.
  toggleWidth: "34px",
  toggleHeight: "20px",
  toggleInset: "2px",
  toggleKnobSize: "14px",
  toggleKnobTravel: 34 - 14 - 2 * 2,

  // Checkbox.
  checkboxSize: "18px",
  checkboxGlyph: "12px",
  checkboxStroke: "1.8",

  // Slider.
  sliderTrackHeight: "4px",
  sliderThumbSize: "14px",

  // RadioGroup.
  radioCircleSize: "16px",
  radioDotSize: "8px",
  radioOptionMinHeight: "28px",

  // Segmented chip vertical padding.
  segmentedPaddingBlock: "1px",

  // Select/Checkbox SVG glyphs.
  chevronSize: "12px",
  chevronStroke: "1.8",

  // ColorField swatch.
  colorSwatchWidth: "36px",
  colorSwatchHeight: "26px",
  colorSwatchPadding: "2px",

  // LED dots (SectionHeading, Surface glow marker).
  ledSize: "7px",
});
