import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import cursorCircleFragment from './cursorCircle.glsl?raw';

function DrawCanvas() {
    return (
        <GpuCanvas
            fragmentShader={cursorCircleFragment}
            canvasInteractions={{ pan: false, zoom: false }}
        />
    );
}

export { DrawCanvas };
