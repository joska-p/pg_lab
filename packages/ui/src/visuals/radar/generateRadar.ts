import { emptyGraphic, f } from '../core/geometry';
import { mulberry32, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicLine } from '../core/types';

const CENTER = 150;

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

export function buildRadar(rand: () => number): CardGraphic {
    const circles: GraphicCircle[] = [];
    const lines: GraphicLine[] = [];

    for (let i = 1; i <= 4; i++) {
        circles.push({
            cx: CENTER,
            cy: CENTER,
            r: i * 30,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 0.4,
            opacity: 0.2 + i * 0.1,
        });
    }

    for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const r1 = 126;
        const r2 = i % 3 === 0 ? 136 : 131;
        const [x1, y1] = polar(CENTER, CENTER, r1, a);
        const [x2, y2] = polar(CENTER, CENTER, r2, a);

        lines.push({
            x1,
            y1,
            x2,
            y2,
            strokeWidth: 0.5,
        });
    }

    const blips = 5 + Math.floor(rand() * 4);

    for (let i = 0; i < blips; i++) {
        const a = rand() * Math.PI * 2;
        const r = 10 + rand() * 115;
        const [x, y] = polar(CENTER, CENTER, r, a);

        circles.push({
            cx: x,
            cy: y,
            r: 1 + rand() * 1.3,
            fill: 'currentColor',
            className: 'blip',
            style: { animationDelay: `${(rand() * 2).toFixed(2)}s` },
        });
    }

    lines.push({
        x1: CENTER,
        y1: CENTER,
        x2: CENTER,
        y2: CENTER - 126,
        strokeWidth: 0.8,
        className: 'radar-sweep',
        style: { transformOrigin: `${f(CENTER)}px ${f(CENTER)}px` },
    });

    return { ...emptyGraphic(), circles, lines };
}

export function generateRadar(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildRadar(rand);
}
