import { Suspense } from 'react';

import { DEFAULT_EXPERIMENT, getExperiment } from '../experiments';
import { useExperimentKey } from '../stores/appStore';

export function Scene() {
    const experimentKey = useExperimentKey();
    const { Scene: ActiveScene } = getExperiment(experimentKey) ?? DEFAULT_EXPERIMENT;

    return (
        <Suspense fallback={null}>
            <ActiveScene />
        </Suspense>
    );
}
