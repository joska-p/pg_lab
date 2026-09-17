import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { familiesConsts } from "../tokens/families.stylex";
import { space } from "../tokens/layout.stylex";
import { typography } from "../tokens/typography.stylex";

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`;

const styles = stylex.create({
  base: {
    width: "100%",
    minHeight: "100dvh",
    height: "100dvh",
    backgroundColor: colors.background,
    backgroundImage: `
      ${NOISE},
      radial-gradient(70% 60% at 8% 90%, color-mix(in oklab, ${familiesConsts.auroraBase} 12%, transparent), transparent 70%),
      radial-gradient(55% 45% at 85% 8%, color-mix(in oklab, ${familiesConsts.solderBase} 10%, transparent), transparent 70%),
      linear-gradient(160deg, ${colors.foreground}, ${colors.background} 65%)
    `,
    backgroundBlendMode: "overlay, normal, normal, normal",
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
    padding: space["0"],
    boxSizing: "border-box",
    "@media (min-width: 1024px)": {
      padding: space["4"],
    },
  },
});

type ShellWrapperProps = {
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ShellWrapper({ style, children }: ShellWrapperProps) {
  return <div {...stylex.props(styles.base, style)}>{children}</div>;
}
