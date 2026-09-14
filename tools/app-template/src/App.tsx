import * as stylex from "@stylexjs/stylex";
import { Button } from "@repo/ui";
import { colors } from "@repo/ui/theme/tokens.stylex";
import { radius, space, typography } from "@repo/ui/theme/consts.stylex";

// Smoke test for the ui contract: one local style map, shared tokens,
// one library component. If this page renders styled, the wiring works
// (see codex/docs/ui-setup.md).
const styles = stylex.create({
  page: {
    minHeight: "100vh",
    backgroundColor: colors.background,
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
  },
  card: {
    maxWidth: 480,
    marginInline: "auto",
    padding: space["6"],
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
    borderRadius: radius.md,
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightSemibold,
  },
});

export default function App() {
  return (
    <div {...stylex.props(styles.page)}>
      <main {...stylex.props(styles.card)}>
        <h1 {...stylex.props(styles.title)}>__APP_NAME__</h1>
        <Button>It works</Button>
      </main>
    </div>
  );
}
