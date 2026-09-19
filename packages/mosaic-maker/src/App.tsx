import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { Stage } from "@repo/ui/components/Stage";
import { MosaicControlsPanel } from "./components/controls/MosaicControlsPanel";
import { MosaicDisplay } from "./components/MosaicDisplay";
import { ErrorBoundary } from "@repo/ui/components/ErrorBoundary";

function App() {
  return (
    <ShellWrapper>
      <ErrorBoundary>
        <ExperimentShell
          panel={
            <ControlPanel title="Mosaic Maker">
              <MosaicControlsPanel />
            </ControlPanel>
          }
        >
          <Stage label="Mosaic">
            <MosaicDisplay />
          </Stage>
        </ExperimentShell>
      </ErrorBoundary>
    </ShellWrapper>
  );
}

export default App;
