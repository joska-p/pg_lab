import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@repo/ui/components/Button";
import { Led } from "@repo/ui/components/Led";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { Stack } from "@repo/ui/components/Stack";
import { Text } from "@repo/ui/components/Text";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { familiesConsts } from "@repo/ui/tokens/families.stylex";
import { focusRing } from "@repo/ui/intents/focus.stylex";
import { pressable } from "@repo/ui/intents/pressable.stylex";
import { interactiveBase } from "@repo/ui/foundations/interaction.stylex";
import { radius } from "@repo/ui/consts/radius.stylex";
import { borderWidth } from "@repo/ui/consts/borderWidth.stylex";
import { typography } from "@repo/ui/consts/typography.stylex";
import { motion } from "@repo/ui/consts/motion.stylex";
import { interaction } from "@repo/ui/consts/interaction.stylex";
import { space } from "@repo/ui/consts/spacing.stylex";
import { zIndex } from "@repo/ui/consts/zIndex.stylex";
import { Laboratory } from "./lab/laboratory";
import { MiniSynth } from "./lab/minisynth";

const backButtonStyles = stylex.create({
  base: {
    position: "absolute",
    top: space["3"],
    left: space["3"],
    zIndex: zIndex.overlay,
  },
});

const launcherStyles = stylex.create({
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space["2"],
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
    width: "100%",
    maxWidth: "480px",
    marginTop: space["8"],
  },
  menuItem: {
    appearance: "none",
    background: colors.card,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space["4"],
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    transitionProperty: "background-color, border-color, box-shadow, transform",
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easingOut,
    transform: {
      default: null,
      ":active": `scale(${interaction.pressScale})`,
    },
    ":hover": {
      backgroundColor: `color-mix(in oklab, ${colors.card} 86%, ${familiesConsts.neonVioletBase})`,
      borderColor: `color-mix(in oklab, ${familiesConsts.neonVioletBase} 55%, ${colors.border})`,
    },
  },
  index: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
  itemTitle: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.foreground,
  },
  itemDesc: {
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
    lineHeight: typography.lineHeightNormal,
  },
});

type View = "menu" | "synth" | "lab";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return [theme, setTheme] as const;
}

function Launcher({ onViewChange }: { onViewChange: (view: "synth" | "lab") => void }) {
  return (
    <ExperimentShell
      panel={
        <ControlPanel title="Menu">
          <ControlSection title="mini-synth">
            <button
              type="button"
              onClick={() => onViewChange("synth")}
              {...stylex.props(
                launcherStyles.menuItem,
                interactiveBase.base,
                focusRing.base,
                pressable.base,
              )}
            >
              <span {...stylex.props(launcherStyles.index)}>01</span>
              <span {...stylex.props(launcherStyles.itemTitle)}>mini synth & showcase</span>
              <span {...stylex.props(launcherStyles.itemDesc)}>
                Interactive synth workspace & comprehensive visual component library.
              </span>
            </button>
          </ControlSection>
          <ControlSection title="visual-laboratory">
            <button
              type="button"
              onClick={() => onViewChange("lab")}
              {...stylex.props(
                launcherStyles.menuItem,
                interactiveBase.base,
                focusRing.base,
                pressable.base,
              )}
            >
              <span {...stylex.props(launcherStyles.index)}>02</span>
              <span {...stylex.props(launcherStyles.itemTitle)}>visual laboratory</span>
              <span {...stylex.props(launcherStyles.itemDesc)}>
                Experimental UI vocabulary, design tokens research, and live canvas probes.
              </span>
            </button>
          </ControlSection>
        </ControlPanel>
      }
    >
      <Stage>
        <Stack direction="horizontal" gap="3" {...stylex.props(launcherStyles.header)}>
          <Led color="amber" live />
          <h1 {...stylex.props(launcherStyles.title)}>pg_lab</h1>
        </Stack>
        <Text variant="muted">Creative Coding Playground & Design Experiments</Text>
      </Stage>
    </ExperimentShell>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
  const [view, setView] = useState<View>("menu");

  return (
    <ShellWrapper>
      {view !== "menu" && (
        <div {...stylex.props(backButtonStyles.base)}>
          <Button onClick={() => setView("menu")}>← menu</Button>
        </div>
      )}

      {view === "menu" && <Launcher onViewChange={setView} />}
      {view === "synth" && <MiniSynth theme={theme} onThemeChange={setTheme} />}
      {view === "lab" && <Laboratory theme={theme} onThemeChange={setTheme} />}
    </ShellWrapper>
  );
}

export default App;
