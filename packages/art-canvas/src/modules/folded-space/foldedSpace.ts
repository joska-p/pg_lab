import { cosinePalette } from '../../shaders/modules/effects/cosinePalette';
import { repeatSpace } from '../../shaders/modules/space/repeatSpace';

const fragmentShader = `
  ${repeatSpace.code}
  ${cosinePalette.code}

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy - 0.5;
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
        float wave = sin(d_space * 8.0 + iTime);
        wave = abs(wave);
        wave = 0.02 / wave;

        vec3 col = cosinePalette(length(uv0) + i * 0.4 + iTime * 0.4, a, b, c, d);

        finalColor += col * wave;
    }

    fragColor = vec4(finalColor, 1.0);
  }
`;

export { fragmentShader as foldedSpaceFragment };
