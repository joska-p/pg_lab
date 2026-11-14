import { SurfaceCanvas } from '@repo/surface/react/SurfaceCanvas';

import { generateShaderFromSeed } from '../../assembly/from-seed';
import { useComplexity, useMood, usePalette, useSeed } from './store';

function SeedCanvas() {
    const seed = useSeed();
    const complexity = useComplexity();
    const mood = useMood();
    const palette = usePalette();

    const fragmentShader = generateShaderFromSeed(seed, complexity, mood, palette);

    return <SurfaceCanvas fragmentShader={fragmentShader} />;
}

export { SeedCanvas };
