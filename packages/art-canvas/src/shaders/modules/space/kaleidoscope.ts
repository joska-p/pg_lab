import code from "../../glsl/space/kaleidoscope.glsl?raw";

import type { ShaderModule } from "../../types";

export const kaleidoscope: ShaderModule = {
  name: "kaleidoscope",
  category: "space",
  weight: 0.8,
  code,
  params: {
    segments: { type: "range", min: 3.0, max: 12.0, precision: 1 },
  },
  getCall: ({ uv = "uv", segments = "6.0" }) => `${uv} = kaleidoscope(${uv}, ${segments});`,
};
