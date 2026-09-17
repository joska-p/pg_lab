import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { colors } from "../tokens/colors.stylex";
import type { FamilyName } from "../tokens/families.stylex";
import { families } from "../tokens/families.stylex";
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

  fill: (color: string) => ({ backgroundColor: color }),
});

// Surface swatches keep the pure `colors` tokens.
const surfaceVariants = stylex.create({
  background: { backgroundColor: colors.background },
  card: { backgroundColor: colors.card },
  popover: { backgroundColor: colors.popover },
  muted: { backgroundColor: colors.muted },
});

export type SwatchSurfaceVariant = keyof typeof surfaceVariants;

type SwatchProps = {
  variant: SwatchSurfaceVariant | FamilyName;
  tension?: "base" | "strong";
  name?: string;
  meta?: string;
  style?: StyleXStyles;
};

export function Swatch({ variant, tension = "base", name, meta, style }: SwatchProps) {
  const fill =
    variant in surfaceVariants
      ? surfaceVariants[variant as SwatchSurfaceVariant]
      : styles.fill(families[variant as FamilyName][tension]);

  return (
    <div {...stylex.props(styles.base, style)}>
      <div aria-hidden {...stylex.props(styles.box, fill)} />
      <span {...stylex.props(fieldText.label)}>{name ?? variant}</span>
      {meta ? <span {...stylex.props(styles.meta)}>{meta}</span> : null}
    </div>
  );
}
