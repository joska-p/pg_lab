import auroraFlowGlsl from './glsl/aurora-flow.glsl?raw';
import edgeDetectGlsl from './glsl/edge-detect.glsl?raw';
import hueShiftGlsl from './glsl/hue-shift.glsl?raw';
import iridescentSheenGlsl from './glsl/iridescent-sheen.glsl?raw';
import neonGlowPulseGlsl from './glsl/neon-glow-pulse.glsl?raw';
import paletteCycleGlsl from './glsl/palette-cycle.glsl?raw';
import rgbGlitchSplitGlsl from './glsl/rgb-glitch-split.glsl?raw';
import spectralShiftGlsl from './glsl/spectral-shift.glsl?raw';
import thermalRadianceGlsl from './glsl/thermal-radiance.glsl?raw';
import thermalVisionGlsl from './glsl/thermal-vision.glsl?raw';
import { defineBehavior } from './types';

export const hueShiftBehavior = defineBehavior({
    id: 'hue-shift',
    label: 'Hue Shift',
    glslFunction: hueShiftGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) => `${color} = hueRotate(${color}, ${time} * ${speed});`,
});

export const colorDriftBehavior = defineBehavior({
    id: 'color-drift',
    label: 'Drift',
    kind: 'color',
    noiseDependencies: ['smoothNoise'],
    applyCode: ({ time, speed, color }) =>
        [
            `float cd_t = ${time} * ${speed} * 0.1;`,
            `vec3 cd_tint = vec3(smoothNoise(cd_t), smoothNoise(cd_t + 17.3), smoothNoise(cd_t + 53.9));`,
            `${color} = mix(${color}, ${color} * (0.6 + 0.8 * cd_tint), 0.4);`,
        ].join('\n  '),
});

export const edgeDetectBehavior = defineBehavior({
    id: 'edge-detect',
    label: 'Contour',
    kind: 'color',
    noiseDependencies: ['smoothNoise'],
    glslFunction: edgeDetectGlsl,
    applyCode: ({ time, speed, color }) =>
        `${color} = applyLaplacianEdges(${color}, vUv, ${time} * ${speed});`,
});

export const vignetteBehavior = defineBehavior({
    id: 'vignette',
    label: 'Vignette',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) => {
        return [
            `float vig_t = ${time} * ${speed};`,
            `float vig_radius = 0.8 + 0.2 * sin(vig_t * 0.2);`,
            `float vig = 1.0 - smoothstep(vig_radius * 0.5, vig_radius, length(${spatial}));`,
            `${color} *= vig;`,
        ].join('\n  ');
    },
});

export const filmGrainBehavior = defineBehavior({
    id: 'film-grain',
    label: 'Grain',
    kind: 'color',
    noiseDependencies: ['random2d'],
    applyCode: ({ time, speed, spatial, color }) => {
        return [
            `float grain_seed = fract(${time} * ${speed});`,
            `float grain = random2d(${spatial} * 100.0 + grain_seed) * 0.15;`,
            `${color} += grain - 0.075;`,
        ].join('\n  ');
    },
});

export const scanLinesBehavior = defineBehavior({
    id: 'scan-lines',
    label: 'Scan',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) => {
        return [
            `float scan_freq = 80.0 + 40.0 * sin(${time} * ${speed} * 0.1);`,
            `float scan = 0.9 + 0.1 * sin(${spatial}.y * scan_freq);`,
            `${color} *= scan;`,
        ].join('\n  ');
    },
});

export const spectralShiftBehavior = defineBehavior({
    id: 'spectral-shift',
    label: 'Palettizer',
    glslFunction: spectralShiftGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) =>
        [
            `float sp_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `${color} = mix(${color}, spectralPalette(sp_lum + ${time} * ${speed} * 0.08), 0.85);`,
        ].join('\n  '),
});

export const iridescentSheenBehavior = defineBehavior({
    id: 'iridescent-sheen',
    label: 'Iridescence',
    glslFunction: iridescentSheenGlsl,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) =>
        `${color} = applyIridescence(${color}, ${spatial}, ${time} * ${speed} * 0.5);`,
});

export const thermalRadianceBehavior = defineBehavior({
    id: 'thermal-radiance',
    label: 'Radiance',
    glslFunction: thermalRadianceGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) =>
        [
            `float th_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `float th_cycle = fract(th_lum + ${time} * ${speed} * 0.04);`,
            `${color} = mix(${color}, branchlessThermal(th_cycle), 0.75);`,
        ].join('\n  '),
});

export const neonReactivePulseBehavior = defineBehavior({
    id: 'neon-reactive',
    label: 'Neon',
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) => {
        return [
            `float nr_lum = dot(${color}, vec3(0.299, 0.587, 0.114));`,
            `float nr_pulse = 0.5 + 0.5 * sin(${time} * ${speed} * 1.2 - length(${spatial}) * 2.0);`,
            `vec3 nr_glow = vec3(0.1, 0.85, 1.0) * smoothstep(0.45, 0.85, nr_lum) * nr_pulse;`,
            `${color} = clamp(${color} + nr_glow * 1.4, 0.0, 1.0);`,
        ].join('\n  ');
    },
});

export const paletteCycleBehavior = defineBehavior({
    id: 'palette-cycle',
    label: 'Cycle',
    glslFunction: paletteCycleGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) =>
        `${color} = mix(${color}, paletteCycleColor(${color}, ${time} * ${speed}), 0.85);`,
});

export const neonGlowPulseBehavior = defineBehavior({
    id: 'neon-glow-pulse',
    label: 'Neon',
    glslFunction: neonGlowPulseGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) => `${color} = neonGlow(${color}, ${time}, ${speed});`,
});

export const rgbGlitchSplitBehavior = defineBehavior({
    id: 'rgb-glitch-split',
    label: 'RGB Split',
    glslFunction: rgbGlitchSplitGlsl,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) =>
        `${color} = rgbGlitchSplit(${color}, ${spatial}, ${time}, ${speed});`,
});

export const auroraFlowBehavior = defineBehavior({
    id: 'aurora-flow',
    label: 'Aurora',
    glslFunction: auroraFlowGlsl,
    kind: 'color',
    applyCode: ({ time, speed, spatial, color }) =>
        `${color} = auroraFlow(${color}, ${spatial}, ${time}, ${speed});`,
});

export const thermalVisionBehavior = defineBehavior({
    id: 'thermal-vision',
    label: 'Thermal',
    glslFunction: thermalVisionGlsl,
    kind: 'color',
    applyCode: ({ time, speed, color }) => `${color} = thermalVision(${color}, ${time}, ${speed});`,
});
