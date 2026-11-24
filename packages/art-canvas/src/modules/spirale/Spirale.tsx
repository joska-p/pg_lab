import { GpuCanvas } from '@repo/surface/react/GpuCanvas';

import spiraleFragment from './spiraleFragment.glsl?raw';
import { useGap } from './store';

function Spirale() {
    const gap = useGap();

    return (
        <GpuCanvas
            fragmentShader={spiraleFragment}
            uniforms={() => ({
                u_gap: gap,
            })}
        />
    );
}

export { Spirale };
