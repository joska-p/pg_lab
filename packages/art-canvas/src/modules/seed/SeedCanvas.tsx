import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import { generateShaderFromSeed } from '../../assembly/from-seed';
import { useComplexity, useMood, usePalette, useSeed } from './store';

function SeedCanvas() {
    const seed = useSeed();
    const complexity = useComplexity();
    const mood = useMood();
    const palette = usePalette();

    const fragmentShader = generateShaderFromSeed(seed, complexity, mood, palette);

    return (
        <GpuCanvas
            fragmentShader={fragmentShader}
            canvasInteractions={{ pan: false, zoom: false }}
        />
    );
}

export { SeedCanvas };
