import * as stylex from "@stylexjs/stylex";
import { interaction } from "../consts/interaction.stylex";

// Disabled intent — universal 45% opacity + not-allowed cursor.
export const disabledStyle = stylex.create({
  base: {
    cursor: interaction.cursorNotAllowed,
    opacity: interaction.disabledOpacity,
  },
});
