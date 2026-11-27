import { Suspense } from 'react';

import type { ExperimentDefinition } from '../experiments';
import { setPerfExperiment } from '../lib/perf';

interface SceneProps {
    readonly experiment: ExperimentDefinition;
}

export function Scene({ experiment }: SceneProps) {
    const ActiveScene = experiment.Scene;

    setPerfExperiment(experiment.id);

    return (
        <Suspense fallback={null}>
            <ActiveScene />
        </Suspense>
    );
}
