import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../theme/tokens.stylex";
import { space, typography } from "../theme/consts.stylex";

const styles = stylex.create({
  base: {
    minHeight: "100vh",
    backgroundColor: colors.background,
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
  },

  container: {
    maxWidth: 1024,
    marginInline: "auto",
    paddingInline: space["6"],
    paddingBlock: space["8"],
    display: "flex",
    flexDirection: "column",
    gap: space["8"],
  },
});

type PageProps = {
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function Page({ style, children }: PageProps) {
  return (
    <div {...stylex.props(styles.base, style)}>
      <main {...stylex.props(styles.container)}>{children}</main>
    </div>
  );
}
