import { Suspense, useEffect } from 'react';

import { EXPERIMENTS } from './experiments';
import { setPerfExperiment } from './lib/perf';
import { useActiveExperiment } from './stores/workshopStore';

export function Scene() {
    const activeExperiment = useActiveExperiment();
    const { Canvas } = EXPERIMENTS[activeExperiment];

    useEffect(() => {
        setPerfExperiment(activeExperiment);
    }, [activeExperiment]);

    return (
        <Suspense fallback={null}>
            <Canvas />
        </Suspense>
    );
}
