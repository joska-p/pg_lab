import { cosinePalette } from '../../shaders/modules/effects/cosinePalette';
import { repeatSpace } from '../../shaders/modules/space/repeatSpace';

// GLSL 300 ES fragment shader — vertex shader is provided by QuadPipeline's
// built-in fullscreen triangle (no vertex shader needed here).
const fragmentShader = `#version 300 es
  precision highp float;

  uniform float u_time;
  in vec2 vUv;

  out vec4 fragColor;

  ${repeatSpace.code}
  ${cosinePalette.code}

  void main() {
    vec2 uv = vUv - 0.5;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    for (float i = 0.0; i < 3.0; i++) {
        uv = repeatSpace(uv, 1.5);

        float d_space = length(uv);
        d_space *= exp(-length(uv0));

        // 1/wave → thin bright peaks (neon glow)
        float wave = sin(d_space * 8.0 + u_time);
        wave = abs(wave);
        wave = 0.02 / wave;

        vec3 col = cosinePalette(length(uv0) + i * 0.4 + u_time * 0.4, a, b, c, d);

        finalColor += col * wave;
    }

    fragColor = vec4(finalColor, 1.0);
  }
`;

export { fragmentShader as foldedSpaceFragment };
