import type { ShaderTemplate } from '../types';

const SinglePassTemplate: ShaderTemplate = {
    name: 'single-pass',
    weight: 0.8,
    generate: ({ spaceBlock, shapeBlock, effectBlock, palette, uniqueInjectedCode }) => `
    ${uniqueInjectedCode}

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 u_mouse = iMouse.xy / iResolution.xy;
      vec2 vUv = fragCoord / iResolution.xy;
      vec2 uv = (vUv - 0.5) * 2.0;
      vec2 uv0 = uv;
      ${spaceBlock}
      ${shapeBlock}
      float interest = 1.0 - smoothstep(0.0, 0.5, abs(dist));
      float wave = abs(sin(dist * 10.0 - iTime * 2.0));
      ${effectBlock}
      float t = wave + iTime * 0.06;
      vec3 a = ${palette.a}; vec3 b = ${palette.b}; vec3 c = ${palette.c}; vec3 d = ${palette.d};
      vec3 col = a + b * cos(6.28318 * (c * t + d));
      col *= interest;
      vec3 bg = vec3(0.02, 0.01, 0.04);
      fragColor = vec4(mix(bg, col, smoothstep(0.0, 0.2, length(col))), 1.0);
    }
  `,
};

export { SinglePassTemplate };
