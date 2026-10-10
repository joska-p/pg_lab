import cosmicMaelstromGlsl from './glsl/cosmic-maelstrom.glsl?raw';
import crystalFacetGlsl from './glsl/crystal-facet.glsl?raw';
import cyberChromaGlitchGlsl from './glsl/cyber-chroma-glitch.glsl?raw';
import domainWarpGlsl from './glsl/domain-warp.glsl?raw';
import glitchBlocksGlsl from './glsl/glitch-blocks.glsl?raw';
import gravityLensGlsl from './glsl/gravity-lens.glsl?raw';
import gravityWellGlsl from './glsl/gravity-well.glsl?raw';
import kaleidoscopeGlsl from './glsl/kaleidoscope.glsl?raw';
import quantumTessellationGlsl from './glsl/quantum-tessellation.glsl?raw';
import rotateGlsl from './glsl/rotate.glsl?raw';
import spiralGalaxyGlsl from './glsl/spiral-galaxy.glsl?raw';
import swirlGlsl from './glsl/swirl.glsl?raw';
import tunnelGlsl from './glsl/tunnel.glsl?raw';
import voronoiGlsl from './glsl/voronoi.glsl?raw';
import waveInterferenceGlsl from './glsl/wave-interference.glsl?raw';
import { defineBehavior } from './types';

export const rotateBehavior = defineBehavior({
    id: 'rotate',
    label: 'Rotate',
    glslFunction: rotateGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = rotate2d(${time} * ${speed} * 0.5) * ${spatial};`,
});

export const swirlBehavior = defineBehavior({
    id: 'swirl',
    label: 'Swirl',
    glslFunction: swirlGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = swirl(${spatial}, sin(${time} * ${speed}) * 2.0);`,
});

export const kaleidoscopeBehavior = defineBehavior({
    id: 'kaleidoscope',
    label: 'Kaleidoscope',
    glslFunction: kaleidoscopeGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = kaleidoscope(${spatial}, ${time}, ${speed});`,
});

export const domainWarpBehavior = defineBehavior({
    id: 'domain-warp',
    label: 'Warp',
    glslFunction: domainWarpGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = domainWarp(${spatial}, ${time}, ${speed});`,
});

export const mirrorTileBehavior = defineBehavior({
    id: 'mirror-tile',
    label: 'Mirror',
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = abs(mod(${spatial} * 1.4 + ${time} * ${speed} * 0.08, 2.0) - 1.0);`,
});

export const tunnelBehavior = defineBehavior({
    id: 'tunnel',
    label: 'Tunnel',
    glslFunction: tunnelGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) => `${spatial} = tunnel(${spatial}, ${time}, ${speed});`,
});

export const noiseCrawlBehavior = defineBehavior({
    id: 'noise-crawl',
    label: 'Crawl',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }) =>
        [
            `vec2 nc_offset = smoothNoise2(vec2(${time} * ${speed} * 0.15, ${time} * ${speed} * 0.18));`,
            `${spatial} += nc_offset * 2.0 - 1.0 * 0.6;`,
        ].join('\n '),
});

export const mouseProximityBehavior = defineBehavior({
    id: 'mouse-proximity',
    label: 'Mouse',
    kind: 'spatial',
    applyCode: ({ spatial }) => {
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
});

export const pixelationBehavior = defineBehavior({
    id: 'pixelation',
    label: 'Pixel',
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) => {
        return [
            `float pix_res = 20.0 + 80.0 * (0.5 + 0.5 * sin(${time} * ${speed} * 0.3));`,
            `${spatial} = floor(${spatial} * pix_res + 0.5) / pix_res;`,
        ].join('\n  ');
    },
});

export const voronoiBehavior = defineBehavior({
    id: 'voronoi',
    label: 'Voronoi',
    glslFunction: voronoiGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = voronoiWarp(${spatial}, ${time}, ${speed});`,
});

export const spiralGalaxyBehavior = defineBehavior({
    id: 'spiral-galaxy',
    label: 'Galaxy',
    glslFunction: spiralGalaxyGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = spiralGalaxy(${spatial}, ${time}, ${speed});`,
});

export const gravityLensBehavior = defineBehavior({
    id: 'gravity-lens',
    label: 'Lens',
    glslFunction: gravityLensGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = gravityLens(${spatial}, ${time}, ${speed});`,
});

export const waveInterferenceBehavior = defineBehavior({
    id: 'wave-interference',
    label: 'Interference',
    glslFunction: waveInterferenceGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = waveInterference(${spatial}, ${time}, ${speed});`,
});

export const crystalFacetBehavior = defineBehavior({
    id: 'crystal-facet',
    label: 'Crystal',
    glslFunction: crystalFacetGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = crystalFacet(${spatial}, ${time}, ${speed});`,
});

export const glitchBlocksBehavior = defineBehavior({
    id: 'glitch-blocks',
    label: 'Glitch',
    glslFunction: glitchBlocksGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = glitchBlocks(${spatial}, ${time}, ${speed});`,
});

export const liquidMetalBehavior = defineBehavior({
    id: 'liquid-metal',
    label: 'Liquid',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }) =>
        [
            `vec2 lm_a = smoothNoise2(${spatial} * 2.0 + vec2(${time} * ${speed} * 0.2));`,
            `vec2 lm_b = smoothNoise2(${spatial} * 2.0 + vec2(${time} * ${speed} * 0.23 + 7.0));`,
            `${spatial} += (lm_a + lm_b - 1.0) * 0.25;`,
        ].join('\n '),
});

export const cosmicMaelstromBehavior = defineBehavior({
    id: 'cosmic-maelstrom',
    label: 'Maelstrom',
    glslFunction: cosmicMaelstromGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = cosmicMaelstrom(${spatial}, ${time}, ${speed});`,
});

export const quantumTessellationBehavior = defineBehavior({
    id: 'quantum-tessellation',
    label: 'Quantum',
    glslFunction: quantumTessellationGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = quantumTessellation(${spatial}, ${time}, ${speed});`,
});

export const gravityWellBehavior = defineBehavior({
    id: 'gravity-well',
    label: 'Singularity',
    glslFunction: gravityWellGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = gravityWell(${spatial}, ${time}, ${speed});`,
});

export const plasmaFluidBehavior = defineBehavior({
    id: 'plasma-fluid',
    label: 'Dynamics',
    kind: 'spatial',
    noiseDependencies: ['smoothNoise2'],
    applyCode: ({ time, speed, spatial }) =>
        [
            `vec2 pf_uv = ${spatial} * 1.5;`,
            `vec2 pf_n1 = smoothNoise2(pf_uv + vec2(${time} * ${speed} * 0.1, ${time} * ${speed} * 0.05));`,
            `vec2 pf_n2 = smoothNoise2(pf_uv * 2.0 - pf_n1 + vec2(-${time} * ${speed} * 0.08, ${time} * ${speed} * 0.12));`,
            `${spatial} += (pf_n2 - 0.5) * 0.35;`,
        ].join('\n  '),
});

export const cyberChromaGlitchBehavior = defineBehavior({
    id: 'cyber-chroma-glitch',
    label: 'Matrix',
    glslFunction: cyberChromaGlitchGlsl,
    kind: 'spatial',
    applyCode: ({ time, speed, spatial }) =>
        `${spatial} = cyberGlitch(${spatial}, ${time}, ${speed});`,
});
