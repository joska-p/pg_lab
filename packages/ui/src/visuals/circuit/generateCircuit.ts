import { emptyGraphic, f, SIZE } from '../core/geometry';
import { mulberry32, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

export function buildCircuit(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const circles: GraphicCircle[] = [];

    const numCurves = 4 + Math.floor(rand() * 4);
    let open = '';

    for (let c = 0; c < numCurves; c++) {
        let x = 20 + rand() * (SIZE - 40);
        let y = 20 + rand() * (SIZE - 40);
        const segments = 8 + Math.floor(rand() * 10);

        open += `M${f(x)},${f(y)}`;

        for (let i = 0; i < segments; i++) {
            const x2 = Math.max(10, Math.min(SIZE - 10, x + (rand() - 0.5) * 90));
            const y2 = Math.max(10, Math.min(SIZE - 10, y + (rand() - 0.5) * 90));
            const cx = (x + x2) / 2 + (rand() - 0.5) * 40;
            const cy = (y + y2) / 2 + (rand() - 0.5) * 40;

            open += ` Q${f(cx)},${f(cy)} ${f(x2)},${f(y2)}`;
            x = x2;
            y = y2;
        }
    }

    paths.push({
        d: open,
        className: 'snake-path',
        strokeWidth: 0.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    });

    const numShapes = 1 + Math.floor(rand() * 2);
    let closed = '';

    for (let s = 0; s < numShapes; s++) {
        const cx = 60 + rand() * (SIZE - 120);
        const cy = 60 + rand() * (SIZE - 120);
        const r = 30 + rand() * 60;
        const points = 6 + Math.floor(rand() * 6);

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const rr = r * (0.7 + rand() * 0.6);
            const px = cx + Math.cos(angle) * rr;
            const py = cy + Math.sin(angle) * rr;

            closed += i === 0 ? `M${f(px)},${f(py)}` : ` L${f(px)},${f(py)}`;
        }

        closed += ' Z';
    }

    paths.push({
        d: closed,
        className: 'snake-path',
        strokeWidth: 0.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    });

    for (let i = 0; i < 12; i++) {
        circles.push({
            cx: rand() * SIZE,
            cy: rand() * SIZE,
            r: 0.8 + rand() * 0.8,
            className: 'twinkle',
        });
    }

    return { ...emptyGraphic(), paths, circles };
}

export function generateCircuit(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildCircuit(rand);
}
