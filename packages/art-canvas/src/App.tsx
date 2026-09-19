import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { ErrorBoundary } from "@repo/ui/components/ErrorBoundary";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Select } from "@repo/ui/components/Select";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { Stage } from "@repo/ui/components/Stage";

import { Atlas } from "./modules/atlas/Atlas";
import { AtlasControls } from "./modules/atlas/controls/AtlasControls";
import { FoldedSpace } from "./modules/folded-space/FoldedSpace";
import { Manual } from "./modules/manual/Manual";
import { ManualControls } from "./modules/manual/ManualControls";
import { SeedCanvas } from "./modules/seed/SeedCanvas";
import { SeedControls } from "./modules/seed/SeedControls";
import { Spirale } from "./modules/spirale/Spirale";
import { SpiraleControls } from "./modules/spirale/SpiraleControls";
import { setInputMode, useInputMode } from "./stores/ui/store";

import type { InputMode } from "./stores/ui/store";

const MODE_OPTIONS = [
  { value: "spirale", label: "Spirale" },
  { value: "seed", label: "Seed" },
  { value: "folded-space", label: "Folded space" },
  { value: "atlas", label: "Atlas" },
  { value: "manual", label: "Manual" },
] as const;

function App() {
  const mode = useInputMode();

  return (
    <ShellWrapper>
      <ErrorBoundary showStack={import.meta.env.DEV}>
        <ExperimentShell
          panel={
            <ControlPanel title="art-canvas">
              <Select<InputMode>
                label="Mode"
                value={mode}
                onValueChange={setInputMode}
                options={MODE_OPTIONS}
              />
              {mode === "spirale" && (
                <ControlSection title="spirale">
                  <SpiraleControls />
                </ControlSection>
              )}
              {mode === "seed" && (
                <ControlSection title="seed">
                  <SeedControls />
                </ControlSection>
              )}
              {mode === "atlas" && (
                <ControlSection title="atlas">
                  <AtlasControls />
                </ControlSection>
              )}
              {mode === "manual" && (
                <ControlSection title="manual">
                  <ManualControls />
                </ControlSection>
              )}
            </ControlPanel>
          }
        >
          <Stage label="art-canvas">
            {mode === "spirale" && <Spirale />}
            {mode === "seed" && <SeedCanvas />}
            {mode === "folded-space" && <FoldedSpace />}
            {mode === "atlas" && <Atlas />}
            {mode === "manual" && <Manual />}
          </Stage>
        </ExperimentShell>
      </ErrorBoundary>
    </ShellWrapper>
  );
}

export default App;
