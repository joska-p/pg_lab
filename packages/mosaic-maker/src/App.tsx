import { useEffect } from "react";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Segmented } from "@repo/ui/components/Segmented";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { Stage } from "@repo/ui/components/Stage";

import { MosaicControlsPanel } from "./components/controls/MosaicControlsPanel";
import { MosaicDisplay } from "./components/MosaicDisplay";
import { setTheme, useTheme } from "./stores/appStore";

function App() {
  const theme = useTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return (
    <ShellWrapper>
      <ExperimentShell
        panel={
          <ControlPanel title="Mosaic Maker">
            <ControlSection title="Theme">
              <Segmented<"light" | "dark" | "system">
                options={["light", "dark", "system"]}
                value={theme}
                onValueChange={setTheme}
              />
            </ControlSection>
            <MosaicControlsPanel />
          </ControlPanel>
        }
      >
        <Stage label="Mosaic">
          <MosaicDisplay />
        </Stage>
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
