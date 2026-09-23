import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { Suspense, useEffect } from 'react';

import { PerfHud } from './components/PerfHud';
import { EXPERIMENTS, type ExperimentId } from './experiments';
import { setPerfExperiment } from './lib/perf';
import { setActiveExperiment, useActiveExperiment } from './stores/workshopStore';

const EXPERIMENT_OPTIONS = (Object.keys(EXPERIMENTS) as ExperimentId[]).map((id) => ({
    value: id,
    label: EXPERIMENTS[id].label,
}));

export function App() {
    const activeExperiment = useActiveExperiment();
    const { Canvas, Controls, label } = EXPERIMENTS[activeExperiment];

    useEffect(() => {
        setPerfExperiment(activeExperiment);
    }, [activeExperiment]);

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="fracture">
                            <ControlSection title="Experiment">
                                <Segmented<ExperimentId>
                                    options={EXPERIMENT_OPTIONS}
                                    value={activeExperiment}
                                    onValueChange={setActiveExperiment}
                                />
                            </ControlSection>

                            {Controls && (
                                <ControlSection title={label}>
                                    <Suspense fallback={null}>
                                        <Controls />
                                    </Suspense>
                                </ControlSection>
                            )}
                            <ControlSection title="Perf">
                                <PerfHud />
                            </ControlSection>
                        </ControlPanel>
                    }
                >
                    <Stage label="fracture">
                        <Suspense fallback={null}>
                            <Canvas />
                        </Suspense>
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
