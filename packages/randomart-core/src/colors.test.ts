import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS, toSrgb } from './colors';

/** Ladder of raw values covering the inside, the bounds and the outside of [-1, 1]. */
const TRIPLETS = [-2, -1, -0.37, 0, 0.5, 1, 2] as const;

describe('toSrgb', () => {
    it('srgb: clamps [-1, 0, 1] and [-3, 0, 3] to [0, 0.5, 1]', () => {
        const cases: readonly [number, number, number][] = [
            [-1, 0, 1],
            [-3, 0, 3],
        ];
        for (const raw of cases) {
            const [r, g, b] = toSrgb('srgb', raw);
            expect(r).toBeCloseTo(0, 6);
            expect(g).toBeCloseTo(0.5, 6);
            expect(b).toBeCloseTo(1, 6);
        }
    });

    it('hsl: zero saturation gives a gray', () => {
        const [r, g, b] = toSrgb('hsl', [0.3, 0, 0]);
        expect(r).toBeCloseTo(0.5, 6);
        expect(g).toBeCloseTo(0.5, 6);
        expect(b).toBeCloseTo(0.5, 6);
    });

    it('hsl: extremes give white and black', () => {
        const white = toSrgb('hsl', [0.2, 0.7, 1]);
        expect(white[0]).toBeCloseTo(1, 6);
        expect(white[1]).toBeCloseTo(1, 6);
        expect(white[2]).toBeCloseTo(1, 6);

        const black = toSrgb('hsl', [0.2, 0.7, -1]);
        expect(black[0]).toBeCloseTo(0, 6);
        expect(black[1]).toBeCloseTo(0, 6);
        expect(black[2]).toBeCloseTo(0, 6);
    });

    it('hsl: hue 0 gives pure red', () => {
        const [r, g, b] = toSrgb('hsl', [-1, 1, 0]);
        expect(r).toBeCloseTo(1, 6);
        expect(g).toBeCloseTo(0, 6);
        expect(b).toBeCloseTo(0, 6);
    });

    it('oklab: black and white bounds, gray in the middle', () => {
        const black = toSrgb('oklab', [-1, 0, 0]);
        expect(black[0]).toBeCloseTo(0, 6);
        expect(black[1]).toBeCloseTo(0, 6);
        expect(black[2]).toBeCloseTo(0, 6);

        const white = toSrgb('oklab', [1, 0, 0]);
        expect(white[0]).toBeCloseTo(1, 6);
        expect(white[1]).toBeCloseTo(1, 6);
        expect(white[2]).toBeCloseTo(1, 6);

        const gray = toSrgb('oklab', [0, 0, 0]);
        expect(gray[0]).toBeCloseTo(gray[1], 6);
        expect(gray[1]).toBeCloseTo(gray[2], 6);
        expect(gray[0]).toBeCloseTo(0.388, 2);
    });

    it('oklch with zero chroma equals oklab', () => {
        const oklch = toSrgb('oklch', [0.2, 0, 0.7]);
        const oklab = toSrgb('oklab', [0.2, 0, 0]);
        expect(oklch[0]).toBeCloseTo(oklab[0], 6);
        expect(oklch[1]).toBeCloseTo(oklab[1], 6);
        expect(oklch[2]).toBeCloseTo(oklab[2], 6);
    });

    it('oklch: out-of-gamut lightness collapses to white/black instead of a hue-shifted color', () => {
        // L=1 admits only white, so any chroma must desaturate to it. Clipping each channel
        // independently would instead yield a saturated magenta.
        const white = toSrgb('oklch', [1, -1, -1]);
        expect(white[0]).toBeCloseTo(1, 6);
        expect(white[1]).toBeCloseTo(1, 6);
        expect(white[2]).toBeCloseTo(1, 6);

        // L=0 admits only black.
        const black = toSrgb('oklch', [-1, -1, -1]);
        expect(black[0]).toBeCloseTo(0, 6);
        expect(black[1]).toBeCloseTo(0, 6);
        expect(black[2]).toBeCloseTo(0, 6);
    });

    it('oklch: gamut mapping preserves the hue instead of clipping channels', () => {
        // L=0.6, C=0.4 at hue 1 rad asks for a green/cyan. A per-channel clamp would zero the
        // green channel and flip the color to red.
        const [r, g, b] = toSrgb('oklch', [0.2, -1, 1 / Math.PI - 1]);
        expect(r).toBeCloseTo(0.747, 2);
        expect(g).toBeCloseTo(0.398, 2);
        expect(b).toBeCloseTo(0.001, 2);
    });

    it('oklab: gamut mapping keeps out-of-gamut colors in range', () => {
        const [r, g, b] = toSrgb('oklab', [0.2, -1, 0]);
        for (const channel of [r, g, b]) {
            expect(Number.isFinite(channel)).toBe(true);
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(1);
        }
    });

    it('range: every space and triplet combination is finite and within [0, 1]', () => {
        for (const id of COLOR_SPACE_IDS) {
            for (const x of TRIPLETS) {
                for (const y of TRIPLETS) {
                    for (const z of TRIPLETS) {
                        const [r, g, b] = toSrgb(id, [x, y, z] as const);
                        for (const channel of [r, g, b]) {
                            expect(Number.isFinite(channel)).toBe(true);
                            expect(channel).toBeGreaterThanOrEqual(0);
                            expect(channel).toBeLessThanOrEqual(1);
                        }
                    }
                }
            }
        }
    });
});
