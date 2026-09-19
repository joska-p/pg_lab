import type { ShaderTemplate } from "../types";

const DirectNoiseTemplate: ShaderTemplate = {
  name: "direct-noise",
  weight: 0.6,
  deps: ["noise2d"],
  generate: ({ spaceBlock, uniqueInjectedCode, palette, effectBlock }) => `
    precision highp float;

    uniform float u_time;
    uniform vec2 u_mouse;
    in vec2 vUv;
    out vec4 fragColor;

    ${uniqueInjectedCode}

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      ${spaceBlock}
      float n = noise2d(uv * 2.0 + vec2(u_time * 0.2));
      float wave = n;
      ${effectBlock}
      float t = wave * 3.0 + u_time * 0.08;
      vec3 col = ${palette.a} + ${palette.b} * cos(6.28318 * (${palette.c} * t + ${palette.d}));
      fragColor = vec4(col, 1.0);
    }
  `,
};

export { DirectNoiseTemplate };
