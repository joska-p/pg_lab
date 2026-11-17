import type { ShaderTemplate } from '../types';

const DirectNoiseTemplate: ShaderTemplate = {
    name: 'direct-noise',
    weight: 0.6,
    deps: ['noise2d'],
    generate: ({ spaceBlock, uniqueInjectedCode, palette, effectBlock }) => `
    ${uniqueInjectedCode}

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 u_mouse = iMouse.xy / iResolution.xy;
      vec2 vUv = fragCoord / iResolution.xy;
      vec2 uv = (vUv - 0.5) * 2.0;
      ${spaceBlock}
      float n = noise2d(uv * 2.0 + vec2(iTime * 0.2));
      float wave = n;
      ${effectBlock}
      float t = wave * 3.0 + iTime * 0.08;
      vec3 col = ${palette.a} + ${palette.b} * cos(6.28318 * (${palette.c} * t + ${palette.d}));
      fragColor = vec4(col, 1.0);
    }
  `,
};

export { DirectNoiseTemplate };
