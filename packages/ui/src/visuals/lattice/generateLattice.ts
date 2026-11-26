import { dist, emptyGraphic, f } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

export interface LatticeCell {
    x: number;
    y: number;
    live: boolean;
}

function hexCorners(cx: number, cy: number, r: number): [number, number][] {
    const pts: [number, number][] = [];

    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 30);

        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }

    return pts;
}

export function meshSegments(cell: LatticeCell, r: number, rand: () => number): string {
    const pts = hexCorners(cell.x, cell.y, r * 0.92);
    const skipEdge = rand() > 0.78 ? randInt(rand, 0, 5) : -1;
    let mesh = '';

    for (let i = 0; i < 6; i++) {
        if (i === skipEdge) {
            continue;
        }

        const a = pts[i];
        const b = pts[(i + 1) % 6];
        if (!a || !b) {
            continue;
        }

        mesh += `M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}`;
    }

    return mesh;
}

export function filledCell(cell: LatticeCell, r: number): string {
    const pts = hexCorners(cell.x, cell.y, r * 0.92);

    return `M${pts.map((p, i) => `${i === 0 ? '' : 'L'}${f(p[0])},${f(p[1])}`).join(' ')} Z`;
}

function nextLiveCell(
    cursor: LatticeCell,
    live: readonly LatticeCell[],
    r: number,
): LatticeCell | undefined {
    return live
        .map((c) => ({ c, d: dist({ x: cursor.x, y: cursor.y }, { x: c.x, y: c.y }) }))
        .filter((n) => n.d > 8 && n.d < r * 3.2)
        .sort((a, b) => a.d - b.d)[0]?.c;
}

export function trailPath(
    cells: readonly LatticeCell[],
    rand: () => number,
    r: number,
): { d: string; circles: GraphicCircle[] } {
    const live = cells.filter((c) => c.live);
    const trailLen = 4 + randInt(rand, 0, 5);
    const circles: GraphicCircle[] = [];

    if (live.length === 0) {
        return { d: '', circles };
    }

    const first = live[Math.floor(rand() * live.length)];
    if (!first) {
        return { d: '', circles };
    }
    let cursor = first;
    let trail = `M${f(cursor.x)},${f(cursor.y)}`;

    for (let i = 0; i < trailLen; i++) {
        const next = nextLiveCell(cursor, live, r);

        if (!next) {
            break;
        }

        cursor = next;
        trail += ` L${f(cursor.x)},${f(cursor.y)}`;
        circles.push({
            cx: cursor.x,
            cy: cursor.y,
            r: 1.4,
            className: 'twinkle',
        });
    }

    return { d: trail, circles };
}

export function buildLattice(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];
    const r = 16.5;
    const cols = 11;
    const rows = 12;
    const cells: LatticeCell[] = [];

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const x = 18 + col * r * 1.72;
            const y = 14 + row * r * 1.52 + (col % 2 === 1 ? r * 0.76 : 0);

            if (x < 14 || y < 14 || x > 286 || y > 286) {
                continue;
            }

            cells.push({ x, y, live: rand() > 0.12 });
        }
    }

    let mesh = '';
    let filled = '';

    for (const cell of cells) {
        if (!cell.live) {
            continue;
        }

        mesh += meshSegments(cell, r, rand);

        if (rand() > 0.78) {
            filled += filledCell(cell, r);
        }
    }

    paths.push({
        d: mesh,
        strokeWidth: 0.55,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: 'lattice-line',
    });

    if (filled) {
        paths.push({
            d: filled,
            fill: 'currentColor',
            fillOpacity: 0.08,
            stroke: 'currentColor',
            strokeWidth: 0.7,
            strokeOpacity: 0.9,
        });
    }

    const trail = trailPath(cells, rand, r);

    if (trail.d) {
        paths.push({
            d: trail.d,
            strokeWidth: 1.15,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: 'snake-path',
        });
    }

    return { ...emptyGraphic(), paths, circles: [...circles, ...trail.circles] };
}

export function generateLattice(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildLattice(rand);
}
