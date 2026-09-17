import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Led } from "@repo/ui/components/Led";
import { Segmented } from "@repo/ui/components/Segmented";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { space } from "@repo/ui/tokens/layout.stylex";
import { typography } from "@repo/ui/tokens/typography.stylex";
import { ShowcaseStage } from "./experiments/showcase/index";
import { LabStage } from "./experiments/lab/laboratory";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "showcase" | "lab";
type ThemeMode = "light" | "dark" | "system";
type PanelPlacement = "docked" | "floating";

// ─── Theme hook ───────────────────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return [theme, setTheme] as const;
}

// ─── Panel nav ────────────────────────────────────────────────────────────────

const navStyles = stylex.create({
  header: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
  },
  title: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase" as const,
    color: colors.foreground,
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [theme, setTheme] = useTheme();
  const [view, setView] = useState<View>("showcase");
  const [panelPlacement, setPanelPlacement] = useState<PanelPlacement>("docked");

  return (
    <ShellWrapper>
      <ExperimentShell
        panelPlacement={panelPlacement}
        panel={
          <ControlPanel title="pg_lab">
            {/* Identity header */}
            <ControlSection title="navigation">
              <div {...stylex.props(navStyles.header)}>
                <Led color="neon-violet" live />
                <span {...stylex.props(navStyles.title)}>pg_lab</span>
              </div>
              <Segmented<View> options={["showcase", "lab"]} value={view} onValueChange={setView} />
            </ControlSection>

            {/* Workspace controls */}
            <ControlSection title="theme">
              <Segmented<ThemeMode>
                options={["light", "dark", "system"]}
                value={theme}
                onValueChange={setTheme}
              />
            </ControlSection>

            <ControlSection title="panel">
              <Segmented<PanelPlacement>
                options={["docked", "floating"]}
                value={panelPlacement}
                onValueChange={setPanelPlacement}
              />
            </ControlSection>
          </ControlPanel>
        }
      >
        {view === "showcase" && <ShowcaseStage synth={undefined} />}
        {view === "lab" && <LabStage />}
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
