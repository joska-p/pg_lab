import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';

import { manual } from './manual';
import { useChroma, useDivisions, useLightness } from './store';

function Manual() {
    const divisions = useDivisions();
    const lightness = useLightness();
    const chroma = useChroma();

    return (
        <SurfaceCanvas
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
