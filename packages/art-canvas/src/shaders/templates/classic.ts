import type { ShaderTemplate } from '../types';

const ClassicTemplate: ShaderTemplate = {
    name: 'classic',
    weight: 1.0,
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
      vec3 finalColor = vec3(0.0);

      vec3 a = ${palette.a}; vec3 b = ${palette.b}; vec3 c = ${palette.c}; vec3 d = ${palette.d};

      for (float i = 0.0; i < 3.0; i++) {
        uv = uv0;
        ${spaceBlock}
        ${shapeBlock} // declares float dist
        float wave = abs(sin(dist * 8.0 - u_time * 1.5));
        ${effectBlock}

        vec3 col = a + b * cos(6.28318 * (c * (dist + i * 0.15 + u_time * 0.05) + d));
        finalColor += col * (smoothstep(0.5, 0.0, abs(dist)) * 0.6);
      }

      fragColor = vec4(finalColor * (1.0 - 0.3 * length(uv0)), 1.0);
    }
  `,
};

export { ClassicTemplate };
