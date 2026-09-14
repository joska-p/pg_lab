import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { space } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
  },

  wrap: {
    flexWrap: "wrap",
  },
});

const justifyVariants = stylex.create({
  start: {
    justifyContent: "flex-start",
  },
  center: {
    justifyContent: "center",
  },
  end: {
    justifyContent: "flex-end",
  },
  between: {
    justifyContent: "space-between",
  },
  around: {
    justifyContent: "space-around",
  },
  evenly: {
    justifyContent: "space-evenly",
  },
});

const directionVariants = stylex.create({
  vertical: {
    flexDirection: "column",
  },
  horizontal: {
    flexDirection: "row",
  },
});

const gapVariants = stylex.create({
  "0": { gap: space["0"] },
  "1": { gap: space["1"] },
  "2": { gap: space["2"] },
  "3": { gap: space["3"] },
  "4": { gap: space["4"] },
  "5": { gap: space["5"] },
  "6": { gap: space["6"] },
  "8": { gap: space["8"] },
  "10": { gap: space["10"] },
  "12": { gap: space["12"] },
  "16": { gap: space["16"] },
});

type StackProps = {
  direction?: keyof typeof directionVariants;
  gap?: keyof typeof gapVariants;
  wrap?: boolean;
  justify?: keyof typeof justifyVariants;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Stack(props: StackProps) {
  const {
    direction = "vertical",
    gap = "3",
    wrap = false,
    justify = "start",
    style,
    children,
  } = props;

  return (
    <div
      {...stylex.props(
        styles.base,
        directionVariants[direction],
        gapVariants[gap],
        wrap ? styles.wrap : null,
        justifyVariants[justify],
        style,
      )}
    >
      {children}
    </div>
  );
}
