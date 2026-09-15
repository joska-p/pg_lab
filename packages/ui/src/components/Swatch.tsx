import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { colors } from "../tokens/colors.stylex";
import { layout } from "../consts/layout.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    flex: 1,
    minWidth: layout.swatchMinWidth,
  },

  box: {
    height: layout.swatchHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },

  meta: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
});

// Surface swatches keep the pure `colors` tokens.
const variants = stylex.create({
  background: { backgroundColor: colors.background },
  card: { backgroundColor: colors.card },
  popover: { backgroundColor: colors.popover },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  accent: { backgroundColor: colors.accent },
  warning: { backgroundColor: colors.warning },
  destructive: { backgroundColor: colors.destructive },
  muted: { backgroundColor: colors.muted },
});

type SwatchProps = {
  variant: keyof typeof variants;
  name?: string;
  meta?: string;
  style?: StyleXStyles;
};

export function Swatch({ variant, name, meta, style }: SwatchProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      <div aria-hidden {...stylex.props(styles.box, variants[variant])} />
      <span {...stylex.props(fieldText.label)}>{name ?? variant}</span>
      {meta ? <span {...stylex.props(styles.meta)}>{meta}</span> : null}
    </div>
  );
}
