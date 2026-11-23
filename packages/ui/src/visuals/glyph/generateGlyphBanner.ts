import { emptyGraphic, f } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicLine, GraphicPath } from '../core/types';
import { filledCell, meshSegments, trailPath } from '../lattice/generateLattice';
import type { LatticeCell } from '../lattice/generateLattice';
import { RUNE_COUNT, runeStrokes } from './generateGlyph';

function cornerBrackets(ox: number, oy: number, size: number, len: number): string {
    const x1 = f(ox);
    const y1 = f(oy);
    const x2 = f(ox + size);
    const y2 = f(oy + size);

    return (
        `M${x1},${f(oy + len)} L${x1},${y1} L${f(ox + len)},${y1} ` +
        `M${f(ox + size - len)},${y1} L${x2},${y1} L${x2},${f(oy + len)} ` +
        `M${x1},${f(oy + size - len)} L${x1},${y2} L${f(ox + len)},${y2} ` +
        `M${f(ox + size - len)},${y2} L${x2},${y2} L${x2},${f(oy + size - len)}`
    );
}

export interface GlyphBannerOptions {
    width?: number;
    height?: number;
}

export function buildGlyphBanner(
    rand: () => number,
    options: GlyphBannerOptions = {},
): CardGraphic {
    const width = options.width ?? 320;
    const height = options.height ?? 96;

    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];
    const lines: GraphicLine[] = [];

    // --- 1. Background Lattice ---
    const r = 14;
    const dx = r * 1.72;
    const dy = r * 1.52;
    const cols = Math.ceil(width / dx) + 2;
    const rows = Math.ceil(height / dy) + 2;
    const cells: LatticeCell[] = [];

    for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
            const x = col * dx + 12;
            const y = row * dy + 10 + (Math.abs(col) % 2 === 1 ? r * 0.76 : 0);

            cells.push({ x, y, live: rand() > 0.16 });
        }
    }

    let mesh = '';
    let filled = '';

    for (const cell of cells) {
        if (!cell.live) {
            continue;
        }

        mesh += meshSegments(cell, r, rand);

        if (rand() > 0.84) {
            filled += filledCell(cell, r);
        }
    }

    if (mesh) {
        paths.push({
            d: mesh,
            strokeWidth: 0.45,
            strokeOpacity: 0.2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: 'lattice-line',
        });
    }

    if (filled) {
        paths.push({
            d: filled,
            fill: 'currentColor',
            fillOpacity: 0.04,
            stroke: 'currentColor',
            strokeWidth: 0.5,
            strokeOpacity: 0.25,
        });
    }

    const trail = trailPath(cells, rand, r);
    if (trail.d) {
        paths.push({
            d: trail.d,
            strokeWidth: 0.8,
            strokeOpacity: 0.4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: 'snake-path',
        });
        circles.push(...trail.circles);
    }

    // --- 2. Tech hairlines & Guides ---
    const cy = height / 2;
    const glyphCount = 5;
    const cellSize = 46;
    const gap = 12;
    const totalRowWidth = glyphCount * cellSize + (glyphCount - 1) * gap;
    const startX = Math.round((width - totalRowWidth) / 2);
    const cellY = Math.round(cy - cellSize / 2);

    lines.push({
        x1: 14,
        y1: cy,
        x2: startX - 8,
        y2: cy,
        strokeWidth: 0.5,
        opacity: 0.3,
    });
    lines.push({
        x1: startX + totalRowWidth + 8,
        y1: cy,
        x2: width - 14,
        y2: cy,
        strokeWidth: 0.5,
        opacity: 0.3,
    });

    lines.push({
        x1: 14,
        y1: cy - 4,
        x2: 14,
        y2: cy + 4,
        strokeWidth: 0.8,
        opacity: 0.45,
    });
    lines.push({
        x1: width - 14,
        y1: cy - 4,
        x2: width - 14,
        y2: cy + 4,
        strokeWidth: 0.8,
        opacity: 0.45,
    });

    // --- 3. Single Row of Glyphs (Foreground) ---
    const inset = 5;
    const u = cellSize - inset * 2;
    const animatedIndex = randInt(rand, 0, glyphCount - 1);

    for (let i = 0; i < glyphCount; i++) {
        const boxX = startX + i * (cellSize + gap);
        const boxY = cellY;
        const ox = boxX + inset;
        const oy = boxY + inset;

        // Framing brackets
        paths.push({
            d: cornerBrackets(boxX + 2, boxY + 2, cellSize - 4, 5),
            strokeWidth: 0.6,
            strokeOpacity: 0.4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        });

        // Glyphs composition
        const complexity = 2 + randInt(rand, 0, 2);
        const used = new Set<number>();
        let d = '';

        for (let k = 0; k < complexity; k++) {
            let idx = randInt(rand, 0, RUNE_COUNT - 1);
            let guard = 0;

            while (used.has(idx) && guard < 8) {
                idx = randInt(rand, 0, RUNE_COUNT - 1);
                guard += 1;
            }

            used.add(idx);
            d += runeStrokes(ox, oy, u, idx);
        }

        const isAnimated = i === animatedIndex;
        paths.push({
            d,
            strokeWidth: 1.25,
            strokeOpacity: 0.9,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            ...(isAnimated ? { className: 'snake-path' } : {}),
        });

        // Twinkle dot on some glyphs
        if (rand() > 0.4) {
            circles.push({
                cx: ox + (rand() > 0.5 ? 0.22 : 0.78) * u,
                cy: oy + (rand() > 0.5 ? 0.22 : 0.78) * u,
                r: 1.3,
                className: 'twinkle',
            });
        }

        // Inter-glyph separator dots
        if (i < glyphCount - 1) {
            circles.push({
                cx: boxX + cellSize + gap / 2,
                cy,
                r: 1.1,
                opacity: 0.35,
            });
        }
    }

    return {
        ...emptyGraphic(),
        paths,
        circles,
        lines,
    };
}

export function generateGlyphBanner(
    seedInput: number | string = 42,
    options: GlyphBannerOptions = {},
): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildGlyphBanner(rand, options);
}
