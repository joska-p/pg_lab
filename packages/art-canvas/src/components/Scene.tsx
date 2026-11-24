import { Suspense } from 'react';

import { getExperiment } from '../experiments';
import { useExperimentKey } from '../stores/appStore';

export function Scene() {
    const experimentKey = useExperimentKey();
    const { Scene } = getExperiment(experimentKey);

    return (
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
    );
}
