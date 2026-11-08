import { Suspense } from 'react';

import { getExperiment } from '../experiments';
import { setPerfExperiment } from '../lib/perf';
import { useExperimentId } from '../stores/appStore';

export function Scene() {
    const experimentId = useExperimentId();
    const { Scene } = getExperiment(experimentId);

    setPerfExperiment(experimentId);

    return (
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
    );
}
