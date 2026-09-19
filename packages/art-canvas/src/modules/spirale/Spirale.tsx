import { GpuCanvas } from "@repo/glaze/react/GpuCanvas";

import spiraleFragment from "./spiraleFragment.glsl?raw";
import { useGap, setClockStore } from "./store";

function Spirale() {
  const gap = useGap();

  return (
    <GpuCanvas
      fragmentShader={spiraleFragment}
      uniforms={() => ({
        u_gap: gap,
      })}
      onClockStore={setClockStore}
      canvasInteractions={{ pan: false, zoom: false }}
    />
  );
}

export { Spirale };
