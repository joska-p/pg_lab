import type { ShaderTemplate } from '../types';

const ClassicTemplate: ShaderTemplate = {
    name: 'classic',
    weight: 1.0,
    generate: ({ spaceBlock, shapeBlock, effectBlock, palette, uniqueInjectedCode }) => `
    ${uniqueInjectedCode}

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 u_mouse = iMouse.xy / iResolution.xy;
      vec2 vUv = fragCoord / iResolution.xy;
      vec2 uv = (vUv - 0.5) * 2.0;
      vec2 uv0 = uv;
      vec3 finalColor = vec3(0.0);

      vec3 a = ${palette.a}; vec3 b = ${palette.b}; vec3 c = ${palette.c}; vec3 d = ${palette.d};

      for (float i = 0.0; i < 3.0; i++) {
        uv = uv0;
        ${spaceBlock}
        ${shapeBlock} // declares float dist
        float wave = abs(sin(dist * 8.0 - iTime * 1.5));
        ${effectBlock}

        vec3 col = a + b * cos(6.28318 * (c * (dist + i * 0.15 + iTime * 0.05) + d));
        finalColor += col * (smoothstep(0.5, 0.0, abs(dist)) * 0.6);
      }

      fragColor = vec4(finalColor * (1.0 - 0.3 * length(uv0)), 1.0);
    }
  `,
};

export { ClassicTemplate };
