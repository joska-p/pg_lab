import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';

import spiraleFragment from './spiraleFragment.glsl?raw';
import { useGap } from './store';

function Spirale() {
    const gap = useGap();

    return (
        <SurfaceCanvas
            fragmentShader={spiraleFragment}
            uniforms={() => ({
                u_gap: gap,
            })}
        />
    );
}

export { Spirale };
