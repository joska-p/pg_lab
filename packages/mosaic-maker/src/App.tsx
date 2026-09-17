import { useEffect } from "react";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { useTheme, setTheme } from "./stores/appStore.tsx";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { Segmented } from "@repo/ui/components/Segmented";

function App() {
  const theme = useTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return (
    <ShellWrapper>
      <ExperimentShell
        panel={
          <ControlPanel title="Experiment controls">
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
        <Stage label="Workspace Stage">
          <h1>Experiment stage</h1>
        </Stage>
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
