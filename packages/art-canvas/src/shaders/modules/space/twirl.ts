import code from "../../glsl/space/twirl.glsl?raw";

import type { ShaderModule } from "../../types";

export const twirl: ShaderModule = {
  name: "twirl",
  category: "space",
  weight: 1.0,
  code,
  params: {
    strength: { type: "range", min: 0.5, max: 4.0 },
  },
  getCall: ({ uv = "uv", strength = "1.0" }) => `uv = twirl(${uv}, ${strength}, vec2(0.0, 0.0));`,
};
