import { Suspense } from 'react';

import { setPerfExperiment } from '../lib/perf';
import { useExperiment } from '../stores/appStore';

export function Scene() {
    const { Scene: ActiveScene, id } = useExperiment();

    setPerfExperiment(id);

    return (
        <Suspense fallback={null}>
            <ActiveScene />
        </Suspense>
    );
}
