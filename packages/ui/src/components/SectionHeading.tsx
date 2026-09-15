import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { glow } from "../effects/glow.stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  led: {
    display: "inline-block",
    width: controls.ledSize,
    height: controls.ledSize,
    borderRadius: radius.full,
    backgroundColor: colorVariants.accentBg,
    color: colorVariants.accentBg,
  },

  index: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  title: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: typography.textCaseUppercase,
  },
});

type SectionHeadingProps = {
  index?: string;
  title: string;
  style?: StyleXStyles;
};

export function SectionHeading({ index, title, style }: SectionHeadingProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      <span aria-hidden {...stylex.props(styles.led, glow.glowSubtle)} />
      {index ? <span {...stylex.props(styles.index)}>{index}</span> : null}
      <h2 {...stylex.props(styles.title)}>{title}</h2>
    </div>
  );
}
