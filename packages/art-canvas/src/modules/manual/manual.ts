// GLSL 300 ES fragment shader — vertex shader is provided by QuadPipeline's
// built-in fullscreen triangle (no vertex shader needed here).
const fragmentShader = `#version 300 es
  precision highp float;

  uniform float uDivisions;
  uniform float uChroma;
  uniform float uLightness;

  in vec2 vUv;

  out vec4 fragColor;

  #define PI 3.141592653589793

  // Pure OKLCH → sRGB pipeline (Ottosson's matrices)
  vec3 oklchToRgb(vec3 oklch) {
      float L = oklch.x;
      float C = oklch.y;
      float h = oklch.z; // Assumed to be in radians [0, 2*PI]

      float a = C * cos(h);
      float b = C * sin(h);

      float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      float s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      float l = l_ * l_ * l_;
      float m = m_ * m_ * m_;
      float s = s_ * s_ * s_;

      vec3 linearRgb;
      linearRgb.r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      linearRgb.g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      linearRgb.b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      // Branchless gamma — cheaper than branching on the GPU
      vec3 lowPart = linearRgb * 12.92;
      vec3 highPart = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;

      vec3 rgb = mix(highPart, lowPart, lessThanEqual(linearRgb, vec3(0.0031308)));

      return clamp(rgb, 0.0, 1.0);
  }

  void main() {
      float columnId = floor(vUv.x * uDivisions);
      float normalizedId = columnId / (uDivisions - 1.0 == 0.0 ? 1.0 : uDivisions - 1.0);
      bool isTop = vUv.y > 0.5;

      float targetLightness = uLightness;
      float targetChroma = uChroma;

      float hueRadians = normalizedId * 2.0 * PI;

      vec3 finalColor = oklchToRgb(vec3(targetLightness, targetChroma, hueRadians));

      if (isTop) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        fragColor = vec4(finalColor, 1.0);
      }
  }
`;

const manual = { fragmentShader };

export { manual };
