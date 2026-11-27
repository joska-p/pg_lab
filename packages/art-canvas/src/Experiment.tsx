import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import { useState } from 'react';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { DEFAULT_EXPERIMENT, getExperiment } from './experiments';
import type { ExperimentId } from './experiments';

export function Experiment() {
    const [experimentId, setExperimentId] = useState<ExperimentId>(DEFAULT_EXPERIMENT.id);
    const experiment = getExperiment(experimentId) ?? DEFAULT_EXPERIMENT;

    return (
        <ExperimentLayout
            stageLabel="art-canvas"
            panel={<Controls experiment={experiment} onExperimentIdChange={setExperimentId} />}
        >
            <Scene experiment={experiment} />
        </ExperimentLayout>
    );
}
