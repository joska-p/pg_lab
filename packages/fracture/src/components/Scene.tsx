import { Suspense, useEffect } from 'react';

import { EXPERIMENTS } from '../experiments';
import { setPerfExperiment } from '../lib/perf';
import { useExperimentKey } from '../stores/appStore';

export function Scene() {
    const experimentKey = useExperimentKey();
    const { Scene } = EXPERIMENTS[experimentKey];

    useEffect(() => {
        setPerfExperiment(experimentKey);
    }, [experimentKey]);

    return (
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
    );
}
