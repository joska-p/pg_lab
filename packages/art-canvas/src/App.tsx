import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";

function App() {
  return (
    <ShellWrapper>
      <ExperimentShell panel={<ControlPanel title="art-canvas"></ControlPanel>}>
        <Stage label="art-canvas"></Stage>
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
