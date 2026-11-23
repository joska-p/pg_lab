import { dist, emptyGraphic, f, SIZE } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

interface Star {
    x: number;
    y: number;
    r: number;
}

function nearestNeighbors(stars: readonly Star[], from: number): readonly Star[] {
    const origin = stars[from];
    if (!origin) {
        return [];
    }
    return stars
        .map((b) => ({ b, d: dist(origin, b) }))
        .filter((n) => n.b !== origin)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .map((n) => n.b);
}

function starLinks(stars: readonly Star[]): string {
    let links = '';
    const used = new Set<string>();

    for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        if (!a) {
            continue;
        }

        for (const b of nearestNeighbors(stars, i)) {
            if (dist(a, b) >= 130) {
                continue;
            }

            const key = [i, stars.indexOf(b)].sort((p, q) => p - q).join('-');

            if (used.has(key)) {
                continue;
            }

            used.add(key);

            links += `M${f(a.x)},${f(a.y)} L${f(b.x)},${f(b.y)}`;
        }
    }

    return links;
}

function fiducialMarks(stars: readonly Star[], rand: () => number): string {
    const marks = 3 + randInt(rand, 0, 2);
    let fiducials = '';

    for (let i = 0; i < marks; i++) {
        const s = stars[Math.floor(rand() * stars.length)];
        if (!s) {
            continue;
        }
        const arm = 4 + rand() * 3;

        fiducials += `M${f(s.x - arm)},${f(s.y)} L${f(s.x + arm)},${f(s.y)}`;
        fiducials += `M${f(s.x)},${f(s.y - arm)} L${f(s.x)},${f(s.y + arm)}`;
    }

    return fiducials;
}

export function buildConstellation(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];
    const count = 16 + randInt(rand, 0, 10);
    const stars: Star[] = Array.from({ length: count }, () => ({
        x: 18 + rand() * (SIZE - 36),
        y: 18 + rand() * (SIZE - 36),
        r: 0.7 + rand() * 1.6,
    }));

    paths.push({
        d: starLinks(stars),
        className: 'constellation-line',
        strokeWidth: 0.45,
        strokeOpacity: 0.7,
        strokeLinecap: 'round',
    });

    const ringCount = 1 + randInt(rand, 0, 2);

    for (let i = 0; i < ringCount; i++) {
        circles.push({
            cx: 90 + rand() * 120,
            cy: 90 + rand() * 120,
            r: 40 + rand() * 80,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 0.4,
            className: 'orbit-dash',
        });
    }

    for (const star of stars) {
        circles.push({
            cx: star.x,
            cy: star.y,
            r: star.r,
            className: 'twinkle',
        });
    }

    paths.push({
        d: fiducialMarks(stars, rand),
        strokeWidth: 0.5,
        strokeOpacity: 0.85,
        strokeLinecap: 'round',
    });

    return { ...emptyGraphic(), paths, circles };
}

export function generateConstellation(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildConstellation(rand);
}
