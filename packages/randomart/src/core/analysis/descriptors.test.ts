import { describe, expect, it } from 'vite-plus/test';

import { describeImage } from './descriptors.ts';
import type { RgbImage } from './descriptors.ts';

const SIZE = 32;

function image(pixel: (x: number, y: number) => [number, number, number]): RgbImage {
    const rgb = new Uint8Array(SIZE * SIZE * 3);

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            rgb.set(pixel(x, y), (y * SIZE + x) * 3);
        }
    }

    return { width: SIZE, height: SIZE, rgb };
}

describe('describeImage', () => {
    it('reads a flat grey image as flat, edgeless and colorless', () => {
        const d = describeImage(image(() => [128, 128, 128]));

        expect(d.flatShare).toBe(1);
        expect(d.edgeDensity).toBe(0);
        expect(d.lumaStd).toBeCloseTo(0);
        expect(d.meanSaturation).toBe(0);
        expect(d.channelCorrelation).toBe(0);
    });

    it('sees a left/right split: sharp edge, asymmetric horizontally, symmetric vertically', () => {
        const d = describeImage(image((x) => (x < SIZE / 2 ? [0, 0, 0] : [255, 255, 255])));

        expect(d.symmetryAxisMax).toBeCloseTo(1);
        expect(d.symmetryAxisMin).toBeCloseTo(0);
        expect(d.edgeSharpness).toBeGreaterThan(0.9);
        expect(d.edgeDensity).toBeGreaterThan(0);
    });

    it('separates a smooth gradient from the same split by edge sharpness', () => {
        const smooth = describeImage(image((x) => [x * 8, x * 8, x * 8]));
        const split = describeImage(image((x) => (x < SIZE / 2 ? [0, 0, 0] : [255, 255, 255])));

        expect(smooth.edgeSharpness).toBeLessThan(split.edgeSharpness);
    });

    it('measures color: a pure red image is saturated with one hue', () => {
        const d = describeImage(image(() => [255, 0, 0]));

        expect(d.meanSaturation).toBeCloseTo(1);
        expect(d.hueConcentration).toBeCloseTo(1);
    });

    it('rejects sizes that cannot be halved four times', () => {
        expect(() =>
            describeImage({ width: 8, height: 8, rgb: new Uint8Array(8 * 8 * 3) }),
        ).toThrow();
    });

    it('returns only finite numbers', () => {
        const d = describeImage(image((x, y) => [(x * 7) % 256, (y * 13) % 256, (x * y) % 256]));

        for (const value of Object.values(d)) {
            expect(Number.isFinite(value)).toBe(true);
        }
    });
});
