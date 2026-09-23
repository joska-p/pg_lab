import { Suspense } from 'react';

import { EXPERIMENTS } from './modes';
import { useInputMode } from './stores/ui/store';

export function Scene() {
    const mode = useInputMode();
    const { Canvas } = EXPERIMENTS[mode];

    return (
        <Suspense fallback={null}>
            <Canvas />
        </Suspense>
    );
}
