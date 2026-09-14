import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { effects } from "../behaviors/effects.stylex";
import { colors } from "../theme/tokens.stylex";
import { radius, space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  led: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
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
    textTransform: "uppercase",
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
      <span aria-hidden {...stylex.props(styles.led, effects.glowSubtle)} />
      {index ? <span {...stylex.props(styles.index)}>{index}</span> : null}
      <h2 {...stylex.props(styles.title)}>{title}</h2>
    </div>
  );
}
