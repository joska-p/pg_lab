import { useRef } from 'react';

import type { ViewerHandle } from '../lib/pattern/viewer';
import { MolCanvas } from './MolCanvas';
import { PatternCanvas } from './PatternCanvas';

export function Scene() {
    const viewerRef = useRef<ViewerHandle>({
        camera: null,
        controls: null,
        requestPatternDraw: null,
    });

    return (
        <>
            <PatternCanvas viewerRef={viewerRef} />
            <MolCanvas viewerRef={viewerRef} />
        </>
    );
}
