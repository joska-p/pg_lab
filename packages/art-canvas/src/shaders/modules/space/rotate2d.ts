import code from "../../glsl/space/rotate2d.glsl?raw";

import type { ShaderModule } from "../../types";

export const rotate2d: ShaderModule = {
  name: "rotate2d",
  category: "space",
  weight: 1.2,
  code,
  params: {
    angle: { type: "global", value: "u_time * 0.15" },
  },
  getCall: ({ uv = "uv", angle = "u_time * 0.15" }) => `${uv} = rotate2d(${uv}, ${angle});`,
};
