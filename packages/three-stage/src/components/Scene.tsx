import { Suspense } from 'react';

import { useExperiment } from '../stores/appStore';

export function Scene() {
    const { Scene: ActiveScene } = useExperiment();

    return (
        <Suspense fallback={null}>
            <ActiveScene />
        </Suspense>
    );
}
