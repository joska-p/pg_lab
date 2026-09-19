import code from "../../glsl/shapes/truchet.glsl?raw";

import type { ShaderModule } from "../../types";

export const truchet: ShaderModule = {
  name: "truchet",
  category: "shapes",
  weight: 1.2,
  code,
  params: {
    scale: { type: "range", min: 1.0, max: 6.0 },
  },
  getCall: ({ uv = "uv", scale = "1.0" }) => `float dist = sdTruchet(${uv}, ${scale});`,
};
