import type { ApplyCodeContext } from './registry';

export const rotateBehavior = {
    id: 'rotate',
    label: 'Rotate',
    glslFunction: `\
mat2 rotate2d(float _angle){
  return mat2(cos(_angle),-sin(_angle),
  sin(_angle),cos(_angle));
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = rotate2d(${time} * ${speed} * 0.5) * ${spatial};`,
} as const;

export const swirlBehavior = {
    id: 'swirl',
    label: 'Swirl',
    glslFunction: `\
vec2 swirl(vec2 coords, float angle) {
  float r = length(coords);
  float a = atan(coords.y, coords.x) + angle * (1.0 - r);
  return vec2(cos(a) * r, sin(a) * r);
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = swirl(${spatial}, sin(${time} * ${speed}) * 2.0);`,
} as const;

export const kaleidoscopeBehavior = {
    id: 'kaleidoscope',
    label: 'Kaleidoscope',
    glslFunction: `\
vec2 kaleidoscope(vec2 coords, float t, float speed) {
  float rot = t * speed * 0.1;
  float c = cos(rot);
  float s = sin(rot);
  coords = vec2(c * coords.x - s * coords.y, s * coords.x + c * coords.y);

  float r = length(coords);
  float a = atan(coords.y, coords.x);

  float slice = 3.14159265 / 6.0;
  a = mod(a + slice, 2.0 * slice) - slice;
  a = abs(a);

  return r * vec2(cos(a), sin(a));
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = kaleidoscope(${spatial}, ${time}, ${speed});`,
} as const;

export const domainWarpBehavior = {
    id: 'domain-warp',
    label: 'Warp',
    glslFunction: `\
vec2 domainWarp(vec2 coords, float t, float speed) {
  vec2 q = vec2(
    sin(coords.y * 1.7 + t * speed * 0.6) * 0.5 + sin(coords.x * 2.3 + 1.2) * 0.3,
    cos(coords.x * 1.3 + t * speed * 0.4) * 0.5 + cos(coords.y * 1.9 + 0.7) * 0.3
  );
  return coords + q * 0.4;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = domainWarp(${spatial}, ${time}, ${speed});`,
} as const;

export const mirrorTileBehavior = {
    id: 'mirror-tile',
    label: 'Mirror',
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = abs(mod(${spatial} * 1.4 + ${time} * ${speed} * 0.08, 2.0) - 1.0);`,
} as const;

export const tunnelBehavior = {
    id: 'tunnel',
    label: 'Tunnel',
    glslFunction: `\
vec2 tunnel(vec2 coords, float t, float speed) {
  float r = length(coords) + 0.0001;
  float a = atan(coords.y, coords.x);
  float depth = fract(log(r) * 0.5 - t * speed * 0.2);
  return vec2(a / 3.14159265, depth * 2.0 - 1.0);
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = tunnel(${spatial}, ${time}, ${speed});`,
} as const;

export const noiseCrawlBehavior = {
    id: 'noise-crawl',
    label: 'Crawl',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        [
            `vec2 nc_offset = smoothNoise2(vec2(${time} * ${speed} * 0.15, ${time} * ${speed} * 0.18));`,
            `${spatial} += nc_offset * 2.0 - 1.0 * 0.6;`,
        ].join('\n '),
} as const;

export const mouseProximityBehavior = {
    id: 'mouse-proximity',
    label: 'Mouse',
    kind: 'spatial',
    applyCode: ({ spatial }: ApplyCodeContext) => {
        return [
            // Glaze hands us `u_mouse` normalized to [0, 1] with y pointing up;
            // the behavior works in pixels measured from the top-left.
            `vec2 mousePx = vec2(u_mouse.x, 1.0 - u_mouse.y) * u_resolution;`,
            `vec2 fragPx = vec2(vUv.x, 1.0 - vUv.y) * u_resolution;`,
            `float distToMouse = length(fragPx - mousePx);`,
            `float force = 1.0 - smoothstep(0.0, 300.0, distToMouse);`,
            `${spatial} += normalize(fragPx - mousePx) * force * 0.25;`,
        ].join('\n  ');
    },
} as const;

export const pixelationBehavior = {
    id: 'pixelation',
    label: 'Pixel',
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) => {
        return [
            `float pix_res = 20.0 + 80.0 * (0.5 + 0.5 * sin(${time} * ${speed} * 0.3));`,
            `${spatial} = floor(${spatial} * pix_res + 0.5) / pix_res;`,
        ].join('\n  ');
    },
} as const;

export const voronoiBehavior = {
    id: 'voronoi',
    label: 'Voronoi',
    glslFunction: `\
vec2 voronoiHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

vec2 voronoiWarp(vec2 x, float t, float speed) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float md = 8.0;
  vec2 mr = x;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = voronoiHash(n + g);
      o = 0.5 + 0.5 * sin(t * speed + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
      }
    }
  }
  return x + mr * (0.5 + 0.5 * sin(md * 3.14159));
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = voronoiWarp(${spatial}, ${time}, ${speed});`,
} as const;

export const spiralGalaxyBehavior = {
    id: 'spiral-galaxy',
    label: 'Galaxy',
    glslFunction: `\
vec2 spiralGalaxy(vec2 coords, float t, float speed) {
  float r = length(coords);
  float a = atan(coords.y, coords.x);
  float spiralAmount = 3.0 * log(r + 0.001) + t * speed * 0.3;
  a += spiralAmount * 0.5;
  return vec2(cos(a), sin(a)) * r;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = spiralGalaxy(${spatial}, ${time}, ${speed});`,
} as const;

export const gravityLensBehavior = {
    id: 'gravity-lens',
    label: 'Lens',
    glslFunction: `\
vec2 gravityLens(vec2 coords, float t, float speed) {
  vec2 center = 0.6 * vec2(cos(t * speed * 0.3), sin(t * speed * 0.37));
  vec2 delta = coords - center;
  float d = length(delta);
  float bend = 0.15 / (d * d + 0.04);
  return coords - normalize(delta + vec2(0.0001)) * bend;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = gravityLens(${spatial}, ${time}, ${speed});`,
} as const;

export const waveInterferenceBehavior = {
    id: 'wave-interference',
    label: 'Interference',
    glslFunction: `\
vec2 waveInterference(vec2 coords, float t, float speed) {
  vec2 p1 = vec2(0.5, 0.3);
  vec2 p2 = vec2(-0.4, -0.5);
  vec2 p3 = vec2(-0.3, 0.6);
  float d1 = length(coords - p1);
  float d2 = length(coords - p2);
  float d3 = length(coords - p3);
  float wave = sin(d1 * 10.0 - t * speed)
             + sin(d2 * 10.0 - t * speed * 1.3)
             + sin(d3 * 10.0 - t * speed * 0.8);
  vec2 dir = normalize(coords + 0.0001);
  return coords + dir * wave * 0.03;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = waveInterference(${spatial}, ${time}, ${speed});`,
} as const;

export const crystalFacetBehavior = {
    id: 'crystal-facet',
    label: 'Crystal',
    glslFunction: `\
vec2 crystalHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

vec2 crystalFacet(vec2 x, float t, float speed) {
  vec2 scaled = x * 3.0;
  vec2 n = floor(scaled);
  vec2 f = fract(scaled);
  float minDist = 8.0;
  vec2 cellOffset = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 h = crystalHash(n + g);
      vec2 cellCenter = g + h;
      float d = length(cellCenter - f);
      if (d < minDist) {
        minDist = d;
        cellOffset = h;
      }
    }
  }
  float facetAngle = t * speed * 0.2 + cellOffset.x * 6.2831;
  mat2 rot = mat2(cos(facetAngle), -sin(facetAngle), sin(facetAngle), cos(facetAngle));
  return rot * x;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = crystalFacet(${spatial}, ${time}, ${speed});`,
} as const;

export const glitchBlocksBehavior = {
    id: 'glitch-blocks',
    label: 'Glitch',
    glslFunction: `\
vec2 glitchBlocks(vec2 coords, float t, float speed) {
  float band = floor(coords.y * 12.0);
  float step_t = floor(t * speed * 4.0);
  float trigger = step(0.85, fract(sin(band * 12.9898 + step_t) * 43758.5453));
  float seed = fract(sin(band * 78.233 + step_t) * 43758.5453);
  float shift = (seed - 0.5) * 0.25 * trigger;
  coords.x += shift;
  return coords;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = glitchBlocks(${spatial}, ${time}, ${speed});`,
} as const;

export const liquidMetalBehavior = {
    id: 'liquid-metal',
    label: 'Liquid',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        [
            `vec2 lm_a = smoothNoise2(${spatial} * 2.0 + vec2(${time} * ${speed} * 0.2));`,
            `vec2 lm_b = smoothNoise2(${spatial} * 2.0 + vec2(${time} * ${speed} * 0.23 + 7.0));`,
            `${spatial} += (lm_a + lm_b - 1.0) * 0.25;`,
        ].join('\n '),
} as const;

export const cosmicMaelstromBehavior = {
    id: 'cosmic-maelstrom',
    label: 'Maelstrom',
    glslFunction: `
vec2 cosmicMaelstrom(vec2 coords, float t, float speed) {
  float r = length(coords);
  float theta = atan(coords.y, coords.x);
  float logR = log(max(r, 0.04));
  float twist = 4.0 * logR + sin(r * 8.0 - t * speed) * 0.5;
  theta += twist * 0.4;
  float pulse = 1.0 + 0.15 * sin(t * speed * 0.8 - r * 3.0);
  return vec2(cos(theta), sin(theta)) * (r * pulse);
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = cosmicMaelstrom(${spatial}, ${time}, ${speed});`,
} as const;

export const quantumTessellationBehavior = {
    id: 'quantum-tessellation',
    label: 'Quantum',
    glslFunction: `
vec2 quantumGridHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

vec2 quantumTessellation(vec2 p, float t, float speed) {
  vec2 scaled = p * 4.0;
  vec2 ip = floor(scaled);
  vec2 fp = fract(scaled);

  float minDist = 4.0;
  vec2 targetOffset = vec2(0.0);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = quantumGridHash(ip + g);
      o = 0.5 + 0.5 * sin(t * speed * 0.5 + o * 6.2831);
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < minDist) {
        minDist = d;
        targetOffset = o;
      }
    }
  }
  float angle = t * speed * 0.15 + (targetOffset.x - targetOffset.y) * 2.0;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  return mix(p, rot * p, smoothstep(0.1, 0.9, minDist));
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = quantumTessellation(${spatial}, ${time}, ${speed});`,
} as const;

export const gravityWellBehavior = {
    id: 'gravity-well',
    label: 'Singularity',
    glslFunction: `
vec2 gravityWell(vec2 coords, float t, float speed) {
  vec2 p1 = 0.5 * vec2(cos(t * speed * 0.4), sin(t * speed * 0.4));
  vec2 p2 = 0.5 * vec2(cos(t * speed * 0.3 + 3.1415), sin(t * speed * 0.5));

  float d1 = length(coords - p1);
  float d2 = length(coords - p2);

  vec2 pull1 = (p1 - coords) * (0.08 / (d1 * d1 + 0.04));
  vec2 pull2 = (p2 - coords) * (0.08 / (d2 * d2 + 0.04));

  return coords + pull1 + pull2;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = gravityWell(${spatial}, ${time}, ${speed});`,
} as const;

export const plasmaFluidBehavior = {
    id: 'plasma-fluid',
    label: 'Dynamics',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        [
            `vec2 pf_uv = ${spatial} * 1.5;`,
            `vec2 pf_n1 = smoothNoise2(pf_uv + vec2(${time} * ${speed} * 0.1, ${time} * ${speed} * 0.05));`,
            `vec2 pf_n2 = smoothNoise2(pf_uv * 2.0 - pf_n1 + vec2(-${time} * ${speed} * 0.08, ${time} * ${speed} * 0.12));`,
            `${spatial} += (pf_n2 - 0.5) * 0.35;`,
        ].join('\n  '),
} as const;

export const cyberChromaGlitchBehavior = {
    id: 'cyber-chroma-glitch',
    label: 'Matrix',
    glslFunction: `
vec2 cyberGlitch(vec2 coords, float t, float speed) {
  float row = floor(coords.y * 24.0);
  float timeline = floor(t * speed * 6.0);

  float trigger = step(0.92, fract(sin(row * 41.134 + timeline) * 43758.5453));
  float shift = (fract(sin(row * 92.73 + timeline) * 23412.18) - 0.5) * 0.3 * trigger;

  coords.x += shift;
  return coords;
}
`,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }: ApplyCodeContext) =>
        `${spatial} = cyberGlitch(${spatial}, ${time}, ${speed});`,
} as const;
