import { ControlSection } from '@repo/ui/components/ControlSection';
import { Segmented } from '@repo/ui/components/Segmented';
import { Suspense } from 'react';

import { PerfHud } from './components/PerfHud';
import { EXPERIMENTS, type ExperimentId } from './experiments';
import { setActiveExperiment, useActiveExperiment } from './stores/workshopStore';

const EXPERIMENT_OPTIONS = (Object.keys(EXPERIMENTS) as ExperimentId[]).map((id) => ({
    value: id,
    label: EXPERIMENTS[id].label,
}));

export function Controls() {
    const activeExperiment = useActiveExperiment();
    const { Controls: ExperimentControls, label } = EXPERIMENTS[activeExperiment];

    return (
        <>
            <ControlSection title="Experiment">
                <Segmented<ExperimentId>
                    options={EXPERIMENT_OPTIONS}
                    value={activeExperiment}
                    onValueChange={setActiveExperiment}
                />
            </ControlSection>

            {ExperimentControls && (
                <ControlSection title={label}>
                    <Suspense fallback={null}>
                        <ExperimentControls />
                    </Suspense>
                </ControlSection>
            )}
            <ControlSection title="Perf">
                <PerfHud />
            </ControlSection>
        </>
    );
}
