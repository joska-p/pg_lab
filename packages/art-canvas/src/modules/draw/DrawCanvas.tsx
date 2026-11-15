import { GpuCanvas } from '@repo/surface/react/GpuCanvas';

import fragment from './fragment.glsl?raw';

function DrawCanvas() {
    return <GpuCanvas fragmentShader={fragment} />;
}

export { DrawCanvas };
