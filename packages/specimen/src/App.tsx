import { useEffect } from "react";
import { ShellWrapper } from "@repo/ui";
import { useTheme, setTheme } from "./stores/appStore";
import { ControlPanel, ExperimentShell, Stage, ControlSection, Segmented } from "@repo/ui";

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
