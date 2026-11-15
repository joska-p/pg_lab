import { GpuCanvas } from '@repo/surface/react/GpuCanvas';

import { manual } from './manual';
import { useChroma, useDivisions, useLightness } from './store';

function Manual() {
    const divisions = useDivisions();
    const lightness = useLightness();
    const chroma = useChroma();

    return (
        <GpuCanvas
            fragmentShader={manual.fragmentShader}
            uniforms={() => ({
                uDivisions: divisions,
                uLightness: lightness,
                uChroma: chroma,
            })}
        />
    );
}

export { Manual };
