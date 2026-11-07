import { describe, expect, it } from 'vite-plus/test';

import { frameStats, imageStats } from './imageStats';
import type { Frame } from './imageStats';

type Rgb = readonly [number, number, number];

function frameFrom(width: number, height: number, color: (x: number, y: number) => Rgb): Frame {
    const rgba = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [red, green, blue] = color(x, y);
            const offset = (y * width + x) * 4;

            rgba[offset] = red;
            rgba[offset + 1] = green;
            rgba[offset + 2] = blue;
            rgba[offset + 3] = 255;
        }
    }

    return { width, height, rgba };
}

const solid = (color: Rgb) => frameFrom(8, 8, () => color);

describe('frameStats', () => {
    it('is flat on a uniform gray frame', () => {
        const stats = frameStats(solid([128, 128, 128]));

        expect(stats.brightness).toBeCloseTo(128 / 255, 4);
        expect(stats.contrast).toBeCloseTo(0, 5);
        expect(stats.sharpness).toBe(0);
        expect(stats.busyness).toBeCloseTo(0, 5);
        expect(stats.colorfulness).toBe(0);
    });

    it('measures contrast and a hard edge on a black/white split', () => {
        const stats = frameStats(frameFrom(8, 8, (x) => (x < 4 ? [0, 0, 0] : [255, 255, 255])));

        expect(stats.brightness).toBeCloseTo(0.5, 4);
        expect(stats.contrast).toBeCloseTo(0.5, 4);
        // Interior columns 1..6, the edge touches columns 3 and 4.
        expect(stats.sharpness).toBeCloseTo(2 / 6, 5);
    });

    it('sees no edge and no detail in a gentle linear ramp', () => {
        const stats = frameStats(frameFrom(16, 4, (x) => [x * 8, x * 8, x * 8]));

        expect(stats.sharpness).toBe(0);
        expect(stats.busyness).toBeCloseTo(0, 5);
    });

    it('reports detail on a checkerboard', () => {
        const stats = frameStats(
            frameFrom(8, 8, (x, y) => ((x + y) % 2 === 0 ? [0, 0, 0] : [255, 255, 255])),
        );

        expect(stats.busyness).toBeGreaterThan(0.2);
    });

    it('measures chroma', () => {
        expect(frameStats(solid([255, 0, 0])).colorfulness).toBeCloseTo(1, 5);
        expect(frameStats(solid([10, 10, 10])).colorfulness).toBe(0);
    });

    it('rejects a buffer of the wrong length', () => {
        expect(() => frameStats({ width: 2, height: 2, rgba: new Uint8Array(4) })).toThrow(
            /needs 16 bytes/,
        );
    });
});

describe('imageStats', () => {
    it('has no motion for a single frame', () => {
        expect(imageStats([solid([10, 20, 30])]).motion).toBe(0);
    });

    it('has no motion between identical frames', () => {
        expect(imageStats([solid([90, 90, 90]), solid([90, 90, 90])]).motion).toBe(0);
    });

    it('averages frame statistics and measures motion', () => {
        const stats = imageStats([solid([0, 0, 0]), solid([255, 255, 255])]);

        expect(stats.brightness).toBeCloseTo(0.5, 4);
        expect(stats.motion).toBeCloseTo(1, 4);
    });

    it('needs at least one frame', () => {
        expect(() => imageStats([])).toThrow(/at least one frame/);
    });
});
