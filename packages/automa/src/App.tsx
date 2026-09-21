import { useEffect } from "react";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { useTheme, setTheme } from "./stores/appStore";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { Segmented } from "@repo/ui/components/Segmented";
import { CellMesh } from "./components/canvas/CellMesh";
import { ErrorBoundary } from "@repo/ui/components/ErrorBoundary";

export function App() {
  const theme = useTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return (
    <ShellWrapper>
      <ErrorBoundary showStack={import.meta.env.DEV}>
        <ExperimentShell
          panel={
            <ControlPanel title="automa controls">
              <ControlSection title="Theme">
                <Segmented<"light" | "dark" | "system">
                  options={["light", "dark", "system"]}
                  value={theme}
                  onValueChange={setTheme}
                />
              </ControlSection>
            </ControlPanel>
          }
        >
          <Stage label="automa">
            <CellMesh />
          </Stage>
        </ExperimentShell>
      </ErrorBoundary>
    </ShellWrapper>
  );
}
