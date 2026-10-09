import type { ApplyCodeContext } from './registry';

export const hueShiftBehavior = {
    id: 'hue-shift',
    label: 'Hue Shift',
    glslFunction: `\
vec3 hueRotate(vec3 color, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(
    (0.299 + 0.701*c + 0.168*s) * color.r + (0.587 - 0.587*c + 0.330*s) * color.g + (0.114 - 0.114*c - 0.331*s) * color.b,
    (0.299 - 0.299*c - 0.328*s) * color.r + (0.587 + 0.413*c + 0.035*s) * color.g + (0.114 - 0.114*c + 0.292*s) * color.b,
    (0.299 - 0.299*c + 1.250*s) * color.r + (0.587 - 0.587*c - 1.050*s) * color.g + (0.114 + 0.886*c - 0.203*s) * color.b
  );
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        `${color} = hueRotate(${color}, ${time} * ${speed});`,
} as const;

export const colorDriftBehavior = {
    id: 'color-drift',
    label: 'Drift',
    kind: 'color',
    noiseDependencies: ['smoothNoise'],
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        [
            `float cd_t = ${time} * ${speed} * 0.1;`,
            `vec3 cd_tint = vec3(smoothNoise(cd_t), smoothNoise(cd_t + 17.3), smoothNoise(cd_t + 53.9));`,
            `${color} = mix(${color}, ${color} * (0.6 + 0.8 * cd_tint), 0.4);`,
        ].join('\n  '),
} as const;

export const edgeDetectBehavior = {
    id: 'edge-detect',
    label: 'Contour',
    kind: 'color',
    noiseDependencies: ['smoothNoise'],
    glslFunction: `\
vec3 applyLaplacianEdges(vec3 baseColor, vec2 uv, float time) {
    float centerLuminance = dot(baseColor, vec3(0.299, 0.587, 0.114));

    float dX = dFdx(centerLuminance);
    float dY = dFdy(centerLuminance);
    float edge = length(vec2(dX, dY));

    float intensityModifier = 1.0 + smoothNoise(time * 0.3) * 1.0;
    edge *= intensityModifier;

    vec3 edgeColor = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0.0, 2.0, 4.0));
    edgeColor *= 1.5;

    return mix(baseColor, edgeColor, smoothstep(0.04, 0.2, edge));
}
`,
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        `${color} = applyLaplacianEdges(${color}, vUv, ${time} * ${speed});`,
} as const;

export const vignetteBehavior = {
    id: 'vignette',
    label: 'Vignette',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) => {
        return [
            `float vig_t = ${time} * ${speed};`,
            `float vig_radius = 0.8 + 0.2 * sin(vig_t * 0.2);`,
            `float vig = 1.0 - smoothstep(vig_radius * 0.5, vig_radius, length(${spatial}));`,
            `${color} *= vig;`,
        ].join('\n  ');
    },
} as const;

export const filmGrainBehavior = {
    id: 'film-grain',
    label: 'Grain',
    kind: 'color',
    noiseDependencies: ['random2d'],
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) => {
        return [
            `float grain_seed = fract(${time} * ${speed});`,
            `float grain = random2d(${spatial} * 100.0 + grain_seed) * 0.15;`,
            `${color} += grain - 0.075;`,
        ].join('\n  ');
    },
} as const;

export const scanLinesBehavior = {
    id: 'scan-lines',
    label: 'Scan',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) => {
        return [
            `float scan_freq = 80.0 + 40.0 * sin(${time} * ${speed} * 0.1);`,
            `float scan = 0.9 + 0.1 * sin(${spatial}.y * scan_freq);`,
            `${color} *= scan;`,
        ].join('\n  ');
    },
} as const;

export const spectralShiftBehavior = {
    id: 'spectral-shift',
    label: 'Palettizer',
    glslFunction: `
vec3 spectralPalette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(2.0, 1.0, 0.0);
  vec3 d = vec3(0.5, 0.20, 0.25);
  return a + b * cos(6.28318 * (c * t + d));
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        [
            `float sp_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `${color} = mix(${color}, spectralPalette(sp_lum + ${time} * ${speed} * 0.08), 0.85);`,
        ].join('\n  '),
} as const;

export const iridescentSheenBehavior = {
    id: 'iridescent-sheen',
    label: 'Iridescence',
    glslFunction: `
vec3 applyIridescence(vec3 baseColor, vec2 coords, float t) {
  float factor = sin(coords.x * 2.5 + t) * cos(coords.y * 2.5 - t);
  vec3 sheen = 0.5 + 0.5 * cos(t + coords.xyx * 3.0 + vec3(0.0, 2.0, 4.0));
  return mix(baseColor, baseColor + sheen * 0.4, smoothstep(-0.5, 0.5, factor));
}
`,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) =>
        `${color} = applyIridescence(${color}, ${spatial}, ${time} * ${speed} * 0.5);`,
} as const;

export const thermalRadianceBehavior = {
    id: 'thermal-radiance',
    label: 'Radiance',
    glslFunction: `
vec3 branchlessThermal(float t) {
  vec3 c1 = vec3(0.0, 0.0, 0.15);
  vec3 c2 = vec3(0.7, 0.0, 0.55);
  vec3 c3 = vec3(1.0, 0.5, 0.0);
  vec3 c4 = vec3(0.98, 0.98, 0.8);

  float ramp1 = smoothstep(0.0, 0.33, t);
  float ramp2 = smoothstep(0.33, 0.66, t);
  float ramp3 = smoothstep(0.66, 1.0, t);

  vec3 col = mix(c1, c2, ramp1);
  col = mix(col, c3, ramp2);
  col = mix(col, c4, ramp3);
  return col;
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        [
            `float th_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `float th_cycle = fract(th_lum + ${time} * ${speed} * 0.04);`,
            `${color} = mix(${color}, branchlessThermal(th_cycle), 0.75);`,
        ].join('\n  '),
} as const;

export const neonReactivePulseBehavior = {
    id: 'neon-reactive',
    label: 'Neon',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) => {
        return [
            `float nr_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `float nr_pulse = 0.5 + 0.5 * sin(${time} * ${speed} * 1.2 - length(${spatial}) * 2.0);`,
            `vec3 nr_glow = vec3(0.1, 0.85, 1.0) * smoothstep(0.45, 0.85, nr_lum) * nr_pulse;`,
            `${color} = clamp(${color} + nr_glow * 1.4, 0.0, 1.0);`,
        ].join('\n  ');
    },
} as const;

export const paletteCycleBehavior = {
    id: 'palette-cycle',
    label: 'Cycle',
    glslFunction: `\
vec3 iqPalette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

vec3 paletteCycleColor(vec3 baseColor, float t) {
  float lum = dot(baseColor, vec3(0.299, 0.587, 0.114));
  return iqPalette(lum + t * 0.15);
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        `${color} = mix(${color}, paletteCycleColor(${color}, ${time} * ${speed}), 0.85);`,
} as const;

export const neonGlowPulseBehavior = {
    id: 'neon-glow-pulse',
    label: 'Neon',
    glslFunction: `\
vec3 neonGlow(vec3 color, float t, float speed) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float pulse = 0.5 + 0.5 * sin(t * speed * 0.6);
  float glow = smoothstep(0.5, 0.9, lum) * pulse;
  return color + glow * vec3(0.3, 0.8, 1.0);
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        `${color} = neonGlow(${color}, ${time}, ${speed});`,
} as const;

export const rgbGlitchSplitBehavior = {
    id: 'rgb-glitch-split',
    label: 'RGB Split',
    glslFunction: `\
vec3 rgbGlitchSplit(vec3 color, vec2 coords, float t, float speed) {
  float band = floor(coords.y * 20.0);
  float step_t = floor(t * speed * 3.0);
  float trigger = step(0.9, fract(sin(band * 91.345 + step_t) * 43758.5453));
  float rShift = trigger * (fract(sin(band * 12.9898 + step_t) * 43758.5453) - 0.5) * 0.4;
  color.r += rShift;
  color.b -= rShift;
  return color;
}
`,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) =>
        `${color} = rgbGlitchSplit(${color}, ${spatial}, ${time}, ${speed});`,
} as const;

export const auroraFlowBehavior = {
    id: 'aurora-flow',
    label: 'Aurora',
    glslFunction: `\
vec3 auroraFlow(vec3 color, vec2 coords, float t, float speed) {
  float wave1 = sin(coords.x * 3.0 + t * speed * 0.4);
  float wave2 = sin(coords.y * 2.0 - t * speed * 0.3 + wave1);
  vec3 aurora = vec3(
    0.2 + 0.3 * sin(wave2),
    0.5 + 0.4 * cos(wave1 * 1.3),
    0.6 + 0.3 * sin(wave1 + wave2)
  );
  return mix(color, color + aurora * 0.3, 0.5);
}
`,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }: ApplyCodeContext) =>
        `${color} = auroraFlow(${color}, ${spatial}, ${time}, ${speed});`,
} as const;

export const thermalVisionBehavior = {
    id: 'thermal-vision',
    label: 'Thermal',
    glslFunction: `\
vec3 thermalPalette(float t) {
  vec3 c1 = vec3(0.0, 0.0, 0.2);
  vec3 c2 = vec3(0.8, 0.0, 0.6);
  vec3 c3 = vec3(1.0, 0.6, 0.0);
  vec3 c4 = vec3(1.0, 1.0, 0.8);
  if (t < 0.33) return mix(c1, c2, t / 0.33);
  else if (t < 0.66) return mix(c2, c3, (t - 0.33) / 0.33);
  else return mix(c3, c4, (t - 0.66) / 0.34);
}

vec3 thermalVision(vec3 color, float t, float speed) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float shift = fract(lum + t * speed * 0.05);
  return mix(color, thermalPalette(shift), 0.7);
}
`,
    kind: 'color',
    applyCode: ({ time, speed, color }: ApplyCodeContext) =>
        `${color} = thermalVision(${color}, ${time}, ${speed});`,
} as const;
