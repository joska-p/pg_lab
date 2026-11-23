import { emptyGraphic, SIZE } from '../core/geometry';
import { mulberry32, toSeed } from '../core/rng';
import type { CardGraphic, GraphicRect } from '../core/types';

export function buildSpectrum(rand: () => number): CardGraphic {
    const rects: GraphicRect[] = [];
    const bars = 26;
    const w = SIZE / bars;

    for (let i = 0; i < bars; i++) {
        const h = 12 + rand() * 150;
        const x = i * w + w * 0.15;
        const bw = w * 0.7;

        rects.push({
            x,
            y: 150 - h / 2,
            width: bw,
            height: h,
            fillOpacity: 0.45 + rand() * 0.5,
            className: 'spec-bar',
            style: {
                animationDelay: `${(i * 0.06).toFixed(2)}s`,
                transformOrigin: `${(x + w * 0.35).toFixed(1)}px 150px`,
            },
        });
    }

    return { ...emptyGraphic(), rects };
}

export function generateSpectrum(seedInput: number | string = 42): CardGraphic {
    const seed = toSeed(seedInput);
    const rand = mulberry32(seed);
    return buildSpectrum(rand);
}
