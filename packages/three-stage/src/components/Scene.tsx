import { Suspense } from 'react';

import type { ExperimentDefinition } from '../experiments';

interface SceneProps {
    readonly experiment: ExperimentDefinition;
}

export function Scene({ experiment }: SceneProps) {
    const ActiveScene = experiment.Scene;

    return (
        <Suspense fallback={null}>
            <ActiveScene />
        </Suspense>
    );
}
