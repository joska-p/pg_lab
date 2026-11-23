import { emptyGraphic, f } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

function runeStrokes(ox: number, oy: number, u: number, idx: number): string {
    const X = (t: number) => f(ox + t * u);
    const Y = (t: number) => f(oy + t * u);

    switch (idx) {
        case 0: {
            return `M${X(0.22)},${Y(0.18)} L${X(0.22)},${Y(0.82)}`;
        }
        case 1: {
            return `M${X(0.78)},${Y(0.18)} L${X(0.78)},${Y(0.82)}`;
        }
        case 2: {
            return `M${X(0.2)},${Y(0.5)} L${X(0.8)},${Y(0.5)}`;
        }
        case 3: {
            return `M${X(0.22)},${Y(0.22)} L${X(0.78)},${Y(0.78)}`;
        }
        case 4: {
            return `M${X(0.78)},${Y(0.22)} L${X(0.22)},${Y(0.78)}`;
        }
        case 5: {
            return `M${X(0.5)},${Y(0.16)} L${X(0.5)},${Y(0.84)}`;
        }
        case 6: {
            return `M${X(0.2)},${Y(0.22)} L${X(0.8)},${Y(0.22)} L${X(0.8)},${Y(0.52)}`;
        }
        case 7: {
            return `M${X(0.2)},${Y(0.72)} Q${X(0.5)},${Y(0.28)} ${X(0.8)},${Y(0.72)}`;
        }
        case 8: {
            return `M${X(0.22)},${Y(0.78)} L${X(0.5)},${Y(0.2)} L${X(0.78)},${Y(0.78)}`;
        }
        default: {
            return `M${X(0.28)},${Y(0.28)} L${X(0.72)},${Y(0.28)} L${X(0.72)},${Y(0.72)} L${X(0.28)},${Y(0.72)} Z`;
        }
    }
}

const RUNE_COUNT = 10;

export function buildGlyph(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];
    const grid = 4;
    const pad = 22;
    const cell = 64;
    const inset = 8;

    for (let row = 0; row < grid; row++) {
        for (let col = 0; col < grid; col++) {
            if (rand() < 0.18) {
                continue;
            }

            const ox = pad + col * cell + inset;
            const oy = pad + row * cell + inset;
            const u = cell - inset * 2;
            const complexity = 3 + randInt(rand, 0, 3);
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

            paths.push({
                d,
                strokeWidth: 1.1,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                ...(rand() > 0.7 ? { className: 'snake-path' } : {}),
            });

            if (rand() > 0.72) {
                circles.push({
                    cx: ox + u * (0.28 + rand() * 0.44),
                    cy: oy + u * (0.28 + rand() * 0.44),
                    r: 1.4 + rand() * 1.2,
                    className: 'twinkle',
                });
            }

            if (rand() > 0.82) {
                const m = 3;

                paths.push({
                    d: `M${f(ox - m)},${f(oy - m)} L${f(ox + u + m)},${f(oy - m)} L${f(ox + u + m)},${f(oy + u + m)} L${f(ox - m)},${f(oy + u + m)} Z`,
                    strokeWidth: 0.4,
                    strokeOpacity: 0.45,
                });
            }
        }
    }

    return { ...emptyGraphic(), paths, circles };
}

export function generateGlyph(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildGlyph(rand);
}
