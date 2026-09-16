import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { fieldText } from "../foundations/text.stylex";
import { space } from "../consts/spacing.stylex";
import { typography } from "../consts/typography.stylex";

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
    textTransform: typography.textCaseUppercase,
  },
});

type ControlSectionProps = {
  title: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ControlSection({ title, style, children }: ControlSectionProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} {...stylex.props(styles.base, style)}>
      <span id={titleId} {...stylex.props(fieldText.label, styles.title)}>
        {title}
      </span>
      {children}
    </section>
  );
}
