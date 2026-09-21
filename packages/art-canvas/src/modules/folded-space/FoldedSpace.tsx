import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { foldedSpaceFragment } from './foldedSpace';

function FoldedSpace() {
    return (
        <GpuCanvas
            fragmentShader={foldedSpaceFragment}
            canvasInteractions={{ pan: false, zoom: false }}
        />
    );
}

export { FoldedSpace };
