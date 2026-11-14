import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';

import fragment from './fragment.glsl?raw';

function DrawCanvas() {
    return <SurfaceCanvas fragmentShader={fragment} />;
}

export { DrawCanvas };
