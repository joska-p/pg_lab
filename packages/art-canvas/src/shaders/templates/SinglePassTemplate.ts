import type { ShaderTemplate } from '../types';

const SinglePassTemplate: ShaderTemplate = {
    name: 'single-pass',
    weight: 0.8,
    generate: ({ spaceBlock, shapeBlock, effectBlock, palette, uniqueInjectedCode }) => `
    precision highp float;

    uniform float u_time;
    uniform vec2 u_mouse;
    in vec2 vUv;
    out vec4 fragColor;

    ${uniqueInjectedCode}

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      vec2 uv0 = uv;
      ${spaceBlock}
      ${shapeBlock}
      float interest = 1.0 - smoothstep(0.0, 0.5, abs(dist));
      float wave = abs(sin(dist * 10.0 - u_time * 2.0));
      ${effectBlock}
      float t = wave + u_time * 0.06;
      vec3 a = ${palette.a}; vec3 b = ${palette.b}; vec3 c = ${palette.c}; vec3 d = ${palette.d};
      vec3 col = a + b * cos(6.28318 * (c * t + d));
      col *= interest;
      vec3 bg = vec3(0.02, 0.01, 0.04);
      fragColor = vec4(mix(bg, col, smoothstep(0.0, 0.2, length(col))), 1.0);
    }
  `,
};

export { SinglePassTemplate };
