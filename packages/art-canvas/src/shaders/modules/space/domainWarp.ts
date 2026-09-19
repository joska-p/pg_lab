import code from "../../glsl/space/domainWarp.glsl?raw";

import type { ShaderModule } from "../../types";

export const domainWarp: ShaderModule = {
  name: "domainWarp",
  category: "space",
  weight: 2.0,
  code,
  params: {
    time: { type: "global", value: "u_time" },
    intensity: { type: "range", min: 0.1, max: 0.5 },
  },
  getCall: ({ uv = "uv", time = "u_time", intensity = "0.1" }) =>
    `${uv} = domainWarp(${uv}, ${time}, ${intensity});`,
};
