import code from "../../glsl/space/polarCoords.glsl?raw";

import type { ShaderModule } from "../../types";

export const polarCoords: ShaderModule = {
  name: "polarCoords",
  category: "space",
  weight: 0.4,
  code,
  getCall: ({ uv = "uv" }) => `uv = polarCoords(${uv});`,
};
