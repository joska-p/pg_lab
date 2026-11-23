import { emptyGraphic } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicEllipse, GraphicLine } from '../core/types';

export function buildOrbit(rand: () => number): CardGraphic {
    const ellipses: GraphicEllipse[] = [];
    const circles: GraphicCircle[] = [];
    const lines: GraphicLine[] = [];
    const cx = 128 + rand() * 44;
    const cy = 128 + rand() * 44;
    const n = 5 + randInt(rand, 0, 4);

    lines.push(
        {
            x1: cx - 90,
            y1: cy,
            x2: cx + 90,
            y2: cy,
            strokeWidth: 0.35,
            opacity: 0.35,
        },
        {
            x1: cx,
            y1: cy - 90,
            x2: cx,
            y2: cy + 90,
            strokeWidth: 0.35,
            opacity: 0.35,
        },
    );

    for (let i = 0; i < n; i++) {
        const rx = 28 + i * 16 + rand() * 14;
        const ry = rx * (0.52 + rand() * 0.42);
        const rotate = rand() * 180;

        ellipses.push({
            cx,
            cy,
            rx,
            ry,
            rotate,
            strokeWidth: 0.55,
            opacity: 0.55 + rand() * 0.4,
            className: 'orbit-dash',
            strokeDasharray: `${(4 + rand() * 10).toFixed(1)} ${(5 + rand() * 10).toFixed(1)}`,
        });

        const satellites = 1 + randInt(rand, 0, 2);

        for (let s = 0; s < satellites; s++) {
            const t = rand() * Math.PI * 2;
            const rot = (rotate * Math.PI) / 180;
            const px = rx * Math.cos(t);
            const py = ry * Math.sin(t);

            circles.push({
                cx: cx + px * Math.cos(rot) - py * Math.sin(rot),
                cy: cy + px * Math.sin(rot) + py * Math.cos(rot),
                r: 1.1 + rand() * 1.4,
                className: 'twinkle',
            });
        }
    }

    circles.push({
        cx,
        cy,
        r: 2.2,
        fill: 'currentColor',
    });

    return { ...emptyGraphic(), ellipses, circles, lines };
}

export function generateOrbit(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildOrbit(rand);
}
