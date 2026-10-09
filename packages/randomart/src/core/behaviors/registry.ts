import {
    auroraFlowBehavior,
    colorDriftBehavior,
    edgeDetectBehavior,
    filmGrainBehavior,
    hueShiftBehavior,
    iridescentSheenBehavior,
    neonGlowPulseBehavior,
    neonReactivePulseBehavior,
    paletteCycleBehavior,
    rgbGlitchSplitBehavior,
    scanLinesBehavior,
    spectralShiftBehavior,
    thermalRadianceBehavior,
    thermalVisionBehavior,
    vignetteBehavior,
} from './color';
import {
    cosmicMaelstromBehavior,
    crystalFacetBehavior,
    cyberChromaGlitchBehavior,
    domainWarpBehavior,
    glitchBlocksBehavior,
    gravityLensBehavior,
    gravityWellBehavior,
    kaleidoscopeBehavior,
    liquidMetalBehavior,
    mirrorTileBehavior,
    mouseProximityBehavior,
    noiseCrawlBehavior,
    pixelationBehavior,
    plasmaFluidBehavior,
    quantumTessellationBehavior,
    rotateBehavior,
    spiralGalaxyBehavior,
    swirlBehavior,
    tunnelBehavior,
    voronoiBehavior,
    waveInterferenceBehavior,
} from './spatial';

export type BehaviorKind = 'spatial' | 'color';

/**
 * GLSL variable names interpolated into a behavior's `applyCode` — the strings are identifiers in
 * the generated shader, not values.
 */
export interface ApplyCodeContext {
    time: string;
    speed: string;
    spatial: string;
    color: string;
}

export interface Behavior {
    readonly id: string;
    readonly label: string;
    readonly glslFunction?: string;
    readonly kind: BehaviorKind;
    readonly applyCode: (ctx: ApplyCodeContext) => string;
    readonly noiseDependencies?: readonly string[];
}

export const BEHAVIORS = {
    // ── Spatial ──
    rotate: rotateBehavior,
    swirl: swirlBehavior,
    kaleidoscope: kaleidoscopeBehavior,
    'domain-warp': domainWarpBehavior,
    'mirror-tile': mirrorTileBehavior,
    tunnel: tunnelBehavior,
    'noise-crawl': noiseCrawlBehavior,
    'mouse-proximity': mouseProximityBehavior,
    pixelation: pixelationBehavior,
    voronoi: voronoiBehavior,
    'spiral-galaxy': spiralGalaxyBehavior,
    'gravity-lens': gravityLensBehavior,
    'wave-interference': waveInterferenceBehavior,
    'crystal-facet': crystalFacetBehavior,
    'glitch-blocks': glitchBlocksBehavior,
    'liquid-metal': liquidMetalBehavior,
    'cosmic-maelstrom': cosmicMaelstromBehavior,
    'quantum-tessellation': quantumTessellationBehavior,
    'gravity-well': gravityWellBehavior,
    'plasma-fluid': plasmaFluidBehavior,
    'cyber-chroma-glitch': cyberChromaGlitchBehavior,
    // ── Color ──
    'hue-shift': hueShiftBehavior,
    'color-drift': colorDriftBehavior,
    'edge-detect': edgeDetectBehavior,
    vignette: vignetteBehavior,
    'film-grain': filmGrainBehavior,
    'scan-lines': scanLinesBehavior,
    'spectral-shift': spectralShiftBehavior,
    'iridescent-sheen': iridescentSheenBehavior,
    'thermal-radiance': thermalRadianceBehavior,
    'neon-reactive': neonReactivePulseBehavior,
    'palette-cycle': paletteCycleBehavior,
    'neon-glow-pulse': neonGlowPulseBehavior,
    'rgb-glitch-split': rgbGlitchSplitBehavior,
    'aurora-flow': auroraFlowBehavior,
    'thermal-vision': thermalVisionBehavior,
} satisfies Record<string, Behavior>;

export type BehaviorId = keyof typeof BEHAVIORS;

export function getBehavior(id: BehaviorId): Behavior {
    return BEHAVIORS[id];
}

const KIND_ORDER: Behavior['kind'][] = ['spatial', 'color'];

const KIND_LABELS: Record<Behavior['kind'], string> = {
    spatial: 'Spatial',
    color: 'Color',
};

export interface BehaviorGroup {
    label: string;
    behaviors: { id: BehaviorId; label: string }[];
}

export function getBehaviorKinds(): BehaviorGroup[] {
    const grouped = new Map<BehaviorKind, { id: BehaviorId; label: string }[]>();

    for (const kind of KIND_ORDER) {
        grouped.set(kind, []);
    }

    for (const [id, b] of Object.entries(BEHAVIORS) as [BehaviorId, Behavior][]) {
        grouped.get(b.kind)!.push({ id, label: b.label });
    }

    return KIND_ORDER.map((k) => ({
        label: KIND_LABELS[k],
        behaviors: grouped.get(k)!,
    }));
}
