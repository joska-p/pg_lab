import * as stylex from "@stylexjs/stylex";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { Stage } from "@repo/ui/components/Stage";
import { MosaicControlsPanel } from "./components/controls/MosaicControlsPanel";
import { MosaicDisplay } from "./components/MosaicDisplay";
import { useTiles } from "./stores/mosaic/selectors";

const styles = stylex.create({
  summary: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
});

function MosaicStage() {
  const tiles = useTiles();
  const count = tiles.length;
  const summary = `Procedural mosaic, ${String(count)} ${count === 1 ? "tile" : "tiles"}`;

  return (
    <Stage label="Mosaic">
      <div role="img" aria-label={summary} {...stylex.props(styles.summary)}>
        <MosaicDisplay />
      </div>
    </Stage>
  );
}

function App() {
  return (
    <ShellWrapper>
      <ExperimentShell
        panel={
          <ControlPanel title="Mosaic Maker">
            <MosaicControlsPanel />
          </ControlPanel>
        }
      >
        <MosaicStage />
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
