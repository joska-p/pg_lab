import { clamp, emptyGraphic, f } from '../core/geometry';
import { mulberry32, randInt, toSeed } from '../core/rng';
import type { CardGraphic, GraphicCircle, GraphicPath } from '../core/types';

export function buildWeave(rand: () => number): CardGraphic {
    const paths: GraphicPath[] = [];
    const rows = 10 + randInt(rand, 0, 6);

    for (let i = 0; i < rows; i++) {
        const y0 = 16 + (i / Math.max(1, rows - 1)) * 268;
        const amp = 6 + rand() * 26;
        const freq = 1.4 + rand() * 2.6;
        const phase = rand() * Math.PI * 2;
        const amp2 = 3 + rand() * 12;
        const freq2 = 3 + rand() * 4.5;
        const steps = 28;
        let d = '';

        for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const x = 10 + t * 280;
            const y = clamp(
                y0 +
                    Math.sin(t * Math.PI * freq + phase) * amp +
                    Math.sin(t * Math.PI * freq2 + phase * 1.7) * amp2,
                8,
                292,
            );

            d += s === 0 ? `M${f(x)},${f(y)}` : ` L${f(x)},${f(y)}`;
        }

        paths.push({
            d,
            className: 'weave-path',
            strokeWidth: 0.45 + rand() * 0.55,
            strokeOpacity: 0.4 + rand() * 0.55,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        });
    }

    const beacons = 4 + randInt(rand, 0, 4);
    const circles: GraphicCircle[] = [];

    for (let i = 0; i < beacons; i++) {
        circles.push({
            cx: 24 + rand() * 252,
            cy: 24 + rand() * 252,
            r: 0.8 + rand() * 1.1,
            className: 'twinkle',
        });
    }

    return { ...emptyGraphic(), paths, circles };
}

export function generateWeave(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildWeave(rand);
}
