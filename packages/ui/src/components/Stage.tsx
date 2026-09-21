import * as stylex from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { borderWidth, layout, radius, space } from "../tokens/layout.stylex";
import { glass } from "../recipes/effects.stylex";

const styles = stylex.create({
  base: {
    flex: 1,
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: layout.stageMinHeight,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    padding: space["4"],
    borderRadius: { default: radius.none, "@media (min-width: 1024px)": radius.md },
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },
});

type StageProps = {
  label?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"section">;

export function Stage({ label, children, ...props }: StageProps) {
  return (
    <section aria-label={label ?? "stage"} {...stylex.props(styles.base, glass.glass)} {...props}>
      {children}
    </section>
  );
}
