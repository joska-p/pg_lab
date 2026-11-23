import { emptyGraphic, f } from '../core/geometry';
import { mulberry32, toSeed } from '../core/rng';
import type { CardGraphic, GraphicPath } from '../core/types';

export function buildContour(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const cx = 150;
    const cy = 150;
    const rings = 3 + Math.floor(rand() * 3);

    for (let r = 0; r < rings; r++) {
        const baseR = 28 + r * (32 + rand() * 14);
        const points = 28;
        const freq1 = 2 + Math.floor(rand() * 3);
        const freq2 = 3 + Math.floor(rand() * 4);
        const amp1 = 4 + rand() * 6;
        const amp2 = 2 + rand() * 4;
        let d = '';

        for (let i = 0; i <= points; i++) {
            const t = (i / points) * Math.PI * 2;
            const rr = baseR + Math.sin(t * freq1) * amp1 + Math.cos(t * freq2) * amp2;

            d += `${i === 0 ? 'M' : 'L'}${f(cx + Math.cos(t) * rr)},${f(cy + Math.sin(t) * rr)} `;
        }

        d += 'Z';

        paths.push({
            d,
            className: 'contour-ring',
            strokeWidth: 0.6,
            style: { animationDelay: `${(r * 0.5).toFixed(2)}s` },
        });
    }

    return { ...emptyGraphic(), paths };
}

export function generateContour(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildContour(rand);
}
