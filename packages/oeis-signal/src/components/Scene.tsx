import { Suspense } from 'react';

import { NaturalsDemo } from './NaturalsDemo';

export function Scene() {
    return (
        <Suspense fallback={null}>
            <NaturalsDemo />
        </Suspense>
    );
}
