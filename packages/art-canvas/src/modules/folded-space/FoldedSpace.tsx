import { GpuCanvas } from '@repo/surface/react/GpuCanvas';

import { foldedSpaceFragment } from './foldedSpace';

function FoldedSpace() {
    return <GpuCanvas fragmentShader={foldedSpaceFragment} />;
}

export { FoldedSpace };
