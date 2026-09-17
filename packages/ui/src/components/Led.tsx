import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { radius } from "../consts/radius.stylex";
import { fx } from "../consts/effects.stylex";
import { layout } from "../consts/layout.stylex";
import { families, type FamilyName } from "../tokens/families.stylex";

const ledStyles = stylex.create({
  base: {
    flexShrink: 0,
    width: layout.ledAtomSize,
    height: layout.ledAtomSize,
    borderRadius: radius.full,
    backgroundColor: "currentColor",
  },
  live: {
    filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
  },
  off: {
    opacity: 0.45,
  },
  fill: (base: string) => ({ color: base }),
});

export type LedProps = {
  /** Hue the mark carries. A single source: never a raw palette string. */
  color: FamilyName;
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
        ledStyles.fill(families[color].base),
        live ? ledStyles.live : null,
        off ? ledStyles.off : null,
        style,
      )}
    />
  );
}
