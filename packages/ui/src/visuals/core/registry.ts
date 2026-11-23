import { generateAtlasPaths } from '../atlas/generateAtlasPaths';
import { buildCircuit } from '../circuit/generateCircuit';
import { buildConstellation } from '../constellation/generateConstellation';
import { buildContour } from '../contour/generateContour';
import { emptyGraphic } from '../core/geometry';
import { graphicSeed, hashHex, mulberry32, toSeed } from '../core/rng';
import type { CardGraphic, CardStyleId } from '../core/types';
import { CARD_STYLE_IDS } from '../core/types';
import { buildGlyph } from '../glyph/generateGlyph';
import { buildLattice } from '../lattice/generateLattice';
import { buildOrbit } from '../orbit/generateOrbit';
import { buildRadar } from '../radar/generateRadar';
import { buildSpectrum } from '../spectrum/generateSpectrum';
import { buildWeave } from '../weave/generateWeave';

export type CardStyleBuilder = (rand: () => number) => CardGraphic;

export interface CardStyleMeta {
    id: CardStyleId;
    label: string;
    blurb: string;
}

export function buildAtlas(rand: () => number): CardGraphic {
    // Generate atlas paths using the PRNG
    const seed = Math.floor(rand() * 1000000);
    const atlas = generateAtlasPaths(seed);

    return {
        ...emptyGraphic(),
        paths: [
            ...atlas.openPaths.map((d) => ({
                d,
                className: 'snake-path',
                strokeWidth: 0.6,
                strokeLinecap: 'round' as const,
                strokeLinejoin: 'round' as const,
            })),
            ...atlas.closedPaths.map((d) => ({
                d,
                className: 'snake-path',
                strokeWidth: 0.6,
                strokeLinecap: 'round' as const,
                strokeLinejoin: 'round' as const,
            })),
        ],
        circles: atlas.dots.map((dot) => ({
            cx: Number.parseFloat(dot.cx),
            cy: Number.parseFloat(dot.cy),
            r: Number.parseFloat(dot.r),
            fill: 'currentColor',
        })),
    };
}

export const CARD_STYLES: readonly CardStyleMeta[] = [
    { id: 'atlas', label: 'Atlas', blurb: 'Lignes topographiques et flux' },
    { id: 'circuit', label: 'Circuit', blurb: 'Traces ouvertes et nœuds' },
    { id: 'constellation', label: 'Constellation', blurb: "Graphe d'étoiles" },
    { id: 'contour', label: 'Contour', blurb: 'Courbes de niveau' },
    { id: 'glyph', label: 'Glyphe', blurb: 'Alphabet procédural' },
    { id: 'lattice', label: 'Treillis', blurb: 'Maille hexagonale' },
    { id: 'orbit', label: 'Orbite', blurb: 'Ellipses et satellites' },
    { id: 'radar', label: 'Radar', blurb: 'Balayage concentrique' },
    { id: 'spectrum', label: 'Spectre', blurb: "Barres d'oscilloscope" },
    { id: 'weave', label: 'Tissage', blurb: 'Champ de flux' },
] as const;

export const BUILDERS: Record<CardStyleId, CardStyleBuilder> = {
    atlas: buildAtlas,
    circuit: buildCircuit,
    constellation: buildConstellation,
    contour: buildContour,
    glyph: buildGlyph,
    lattice: buildLattice,
    orbit: buildOrbit,
    radar: buildRadar,
    spectrum: buildSpectrum,
    weave: buildWeave,
};

export function styleFromSeed(seed: number): CardStyleId {
    const styleId = CARD_STYLE_IDS[seed % CARD_STYLE_IDS.length];
    return styleId ?? 'circuit';
}

export function isCardStyleId(value: unknown): value is CardStyleId {
    return typeof value === 'string' && (CARD_STYLE_IDS as readonly string[]).includes(value);
}

export function generateGraphic(style: CardStyleId, seed: number): CardGraphic {
    const styleIndex = CARD_STYLE_IDS.indexOf(style);
    const rand = mulberry32(graphicSeed(seed, styleIndex));
    return BUILDERS[style](rand);
}

export interface CardVisualData {
    style: CardStyleId;
    seed: number;
    hashHex: string;
    graphic: CardGraphic;
}

export function generateCardVisual(
    seedInput: string | number,
    styleOverride?: CardStyleId,
): CardVisualData {
    const seed = toSeed(seedInput);
    const style = styleOverride ?? styleFromSeed(seed);

    return {
        style,
        seed,
        hashHex: hashHex(seed),
        graphic: generateGraphic(style, seed),
    };
}
