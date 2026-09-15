import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";

// State intents: shared behaviors for component state changes.
export const active = stylex.create({
  fill: (color: string) => ({
    backgroundColor: color,
    borderColor: color,
  }),
  knob: {
    backgroundColor: colors.background,
  },
});
