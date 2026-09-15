import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";
import { controls } from "../consts/controls.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";
import { families, type FamilyName } from "../consts/families.stylex";
import { Led } from "../intents/led.stylex";

const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
    paddingBlock: controls.badgePaddingBlock,
    paddingInline: space["2"],
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
  family: (strong: string) => ({
    color: strong,
    borderColor: `color-mix(in oklab, ${strong} 60%, transparent)`,
  }),
  neutral: {
    color: colorVariants.mutedFg,
    borderColor: colors.border,
  },
});

type BadgeProps = {
  family?: FamilyName;
  live?: boolean;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Badge({ family, live = false, style, children }: BadgeProps) {
  const fam = family ? families[family] : null;

  return (
    <span {...stylex.props(styles.base, fam ? styles.family(fam.strong) : styles.neutral, style)}>
      {fam ? <Led color={fam.base} live={live} /> : null}
      {children}
    </span>
  );
}
