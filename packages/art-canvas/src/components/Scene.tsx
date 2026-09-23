import { Suspense } from 'react';

import { EXPERIMENTS } from '../experiments';
import { useExperimentKey } from '../stores/appStore';

export function Scene() {
    const experimentKey = useExperimentKey();
    const { Scene } = EXPERIMENTS[experimentKey];

    return (
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
    );
}
