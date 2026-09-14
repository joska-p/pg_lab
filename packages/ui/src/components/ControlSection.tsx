import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../behaviors/text.stylex";
import { space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
  },

  title: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },
});

type ControlSectionProps = {
  title: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ControlSection({ title, style, children }: ControlSectionProps) {
  return (
    <section {...stylex.props(styles.base, style)}>
      <span {...stylex.props(fieldText.label, styles.title)}>{title}</span>
      {children}
    </section>
  );
}
