// GLSL 300 ES fragment shader — QuadPipeline provides the vertex shader; only the fragment program is needed here.
export const SYLLABIC_FIBONACCI_FRAGMENT = `#version 300 es
  precision highp float;

  uniform float u_time;
  uniform float uGridSize;
  uniform float uModulo;
  uniform float uSymbolType;
  uniform float uPalette;
  uniform float uGlitch;
  uniform float uSeedOffset;

  in vec2 vUv;
  out vec4 fragColor;

  // Binet's formula: avoids pow(negative, n) which returns NaN on several GPUs
  float fibonacci(float n) {
      float phi = (1.0 + sqrt(5.0)) / 2.0;
      return floor(pow(phi, n) / sqrt(5.0) + 0.5);
  }

  // Triangle SDF (arrow Syllabics: ᐱ ᐯ ᐸ ᐳ)
  float sdTriangle(in vec2 p, in float r) {
      const float k = sqrt(3.0);
      p.x = abs(p.x) - r;
      p.y = p.y + r/k;
      if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
      p.x -= clamp( p.x, -2.0*r, 0.0 );
      return -length(p)*sign(p.y);
  }

  // Rounded Box SDF (container Syllabics: ᑕ ᑐ ᑎ ᑕ)
  float sdRoundBox(in vec2 p, in vec2 b, in vec4 r) {
      r.xy = (p.x > 0.0) ? r.xy : r.zw;
      r.x  = (p.y > 0.0) ? r.x  : r.y;
      vec2 q = abs(p) - b + r.x;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
  }

  float sdArc(in vec2 p, in float ta, in float tb, in float r) {
      vec2 sca = vec2(sin(ta), cos(ta));
      vec2 scb = vec2(sin(tb), cos(tb));
      p = mat2(sca.y, -sca.x, sca.x, sca.y) * p;
      p.x = abs(p.x);
      float k = (scb.y * p.x > scb.x * p.y) ? dot(p, scb) : length(p);
      return sqrt(dot(p, p) + r * r - 2.0 * r * k);
  }

  vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
  }

  vec3 getPalette(float id, float factor) {
      if (id < 0.5) {
          // Cyberpunk Neon
          return mix(vec3(0.04, 0.01, 0.08), vec3(0.0, 0.95, 0.85), factor);
      } else if (id < 1.5) {
          // Aboriginal Ochre, Clay & Charcoal Earth tones
          return mix(vec3(0.12, 0.04, 0.02), vec3(0.92, 0.45, 0.15), factor);
      } else if (id < 2.5) {
          // Aurora Borealis Night sky
          return mix(vec3(0.01, 0.03, 0.06), vec3(0.15, 0.9, 0.45), factor);
      } else {
          // Blueprint Monochrome Tech
          return mix(vec3(0.05, 0.06, 0.1), vec3(0.85, 0.9, 1.0), factor);
      }
  }

  void main() {
    vec2 uv = vUv;

    if (uGlitch > 0.02) {
        float glitchLine = step(0.97 - (uGlitch * 0.02), sin(uv.y * 60.0 + u_time * 12.0));
        uv.x += glitchLine * sin(uv.y * 180.0) * 0.04 * uGlitch;
    }

    vec2 gridCount = vec2(uGridSize);
    vec2 gridUv = fract(uv * gridCount);
    vec2 cellId = floor(uv * gridCount);

    float fibIndex = cellId.x + cellId.y * gridCount.x + floor(uSeedOffset);

    // mod 24: keep the sequence within GLSL float precision limits
    float fibVal = fibonacci(mod(fibIndex, 24.0));
    float signal = mod(fibVal, uModulo);

    // Rotational grammar: full circle per modulo step
    float angle = signal * ((2.0 * 3.1415926) / uModulo);

    vec2 p = gridUv - 0.5;
    p = rotate(p, angle);

    float d = 999.0;
    if (uSymbolType < 0.5) {
        d = sdTriangle(p, 0.22);
    } else if (uSymbolType < 1.5) {
        d = max(
            sdRoundBox(p, vec2(0.24, 0.24), vec4(0.05)),
            -sdRoundBox(p + vec2(0.1, 0.0), vec2(0.2, 0.18), vec4(0.02))
        );
    } else if (uSymbolType < 2.5) {
        d = sdArc(p, 0.0, 1.8, 0.2) - 0.04;
    } else {
        d = max(
            abs(p.x) + abs(p.y) - 0.35,
            -(abs(p.x + 0.08) + abs(p.y + 0.08) - 0.28)
        );
    }

    float sharp = smoothstep(0.015, 0.0, d);

    vec3 bg = getPalette(uPalette, signal / uModulo);
    vec3 shapeColor = getPalette(uPalette, 1.0);

    // Subtle grid borders
    float gridLine = smoothstep(0.48, 0.5, abs(gridUv.x - 0.5)) + smoothstep(0.48, 0.5, abs(gridUv.y - 0.5));
    bg = mix(bg, bg * 1.25, gridLine * 0.12);

    vec3 col = mix(bg, shapeColor, sharp);
    fragColor = vec4(col, 1.0);
  }
`;
