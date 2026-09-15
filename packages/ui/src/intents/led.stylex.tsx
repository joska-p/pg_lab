import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { controls } from "../consts/controls.stylex";
import { radius } from "../consts/radius.stylex";
import { fx } from "../consts/effects.stylex";

const ledStyles = stylex.create({
  base: {
    flexShrink: 0,
    width: controls.ledSize,
    height: controls.ledSize,
    borderRadius: radius.full,
    backgroundColor: "currentColor",
  },
  live: {
    filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
  },
  off: {
    opacity: 0.45,
  },
  fill: (color: string) => ({ color }),
});

export type LedProps = {
  color: string;
  live?: boolean;
  off?: boolean;
  style?: StyleXStyles;
};

export function Led({ color, live = false, off = false, style }: LedProps) {
  return (
    <span
      aria-hidden="true"
      {...stylex.props(
        ledStyles.base,
        ledStyles.fill(color),
        live ? ledStyles.live : null,
        off ? ledStyles.off : null,
        style,
      )}
    />
  );
}
