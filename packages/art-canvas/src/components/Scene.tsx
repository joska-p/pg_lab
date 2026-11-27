import { Suspense } from 'react';

import { getExperiment } from '../experiments';
import { useExperimentContext } from '../stores/useExperimentContext';

export function Scene() {
    const { experimentId } = useExperimentContext();
    const experiment = getExperiment(experimentId);
    const ActiveScene = experiment?.Scene;

    return <Suspense fallback={null}>{ActiveScene && <ActiveScene />}</Suspense>;
}
