import { GpuCanvas } from "@repo/glaze/react/GpuCanvas";

import {
  useComplexity,
  useGlitch,
  useModulo,
  usePalette,
  useSeed,
  useSymbolType,
} from "./store/selectors";
import { SYLLABIC_FIBONACCI_FRAGMENT } from "./SyllabicFibonacciMaterial";

function Atlas() {
  const seed = useSeed();
  const modulo = useModulo();
  const complexity = useComplexity();
  const symbolType = useSymbolType();
  const palette = usePalette();
  const glitch = useGlitch();

  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const seedOffset = Math.abs(hash % 1000);

  return (
    <GpuCanvas
      fragmentShader={SYLLABIC_FIBONACCI_FRAGMENT}
      uniforms={() => ({
        uGridSize: complexity,
        uModulo: modulo,
        uSymbolType: symbolType,
        uPalette: palette,
        uGlitch: glitch,
        uSeedOffset: seedOffset,
      })}
      canvasInteractions={{ pan: false, zoom: false }}
    />
  );
}

export { Atlas };
