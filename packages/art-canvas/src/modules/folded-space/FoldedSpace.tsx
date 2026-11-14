import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';

import { foldedSpaceFragment } from './foldedSpace';

function FoldedSpace() {
    return <SurfaceCanvas fragmentShader={foldedSpaceFragment} />;
}

export { FoldedSpace };
