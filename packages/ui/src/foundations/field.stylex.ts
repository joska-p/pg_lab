import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { families } from "../tokens/families.stylex";
import { shadowColor, shadows } from "../tokens/shadows.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";

export const field = stylex.create({
  col: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    flex: 1,
    minWidth: "fit-content",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
  },
  well: {
    width: "100%",
    minWidth: 0,
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    [shadowColor.color]: colors.input,
    boxShadow: shadows.sunken,
    outline: "none",
    ":focus": {
      borderColor: `color-mix(in oklab, ${colors.ring} 55%, ${colors.border})`,
      boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
    },
  },

  // The sanctioned invalid face (Heuristic #9): the error family owns the
  // border, the recess stays, keyboard focus still answers with the ring so
  // focus is never conflated with error.
  wellInvalid: {
    borderColor: families.error.base,
    ":focus": {
      borderColor: families.error.base,
    },
  },
});
