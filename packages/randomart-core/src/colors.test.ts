import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS, toSrgb } from './colors';

/** Échelon de valeurs brutes couvrant l'intérieur, les bornes et l'extérieur de [-1, 1]. */
const TRIPLETS = [-2, -1, -0.37, 0, 0.5, 1, 2] as const;

describe('toSrgb', () => {
    it('srgb : clamp [-1, 0, 1] et [-3, 0, 3] sur [0, 0.5, 1]', () => {
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

    it('hsl : saturation nulle donne un gris', () => {
        const [r, g, b] = toSrgb('hsl', [0.3, 0, 0]);
        expect(r).toBeCloseTo(0.5, 6);
        expect(g).toBeCloseTo(0.5, 6);
        expect(b).toBeCloseTo(0.5, 6);
    });

    it('hsl : extrêmes donnent blanc et noir', () => {
        const white = toSrgb('hsl', [0.2, 0.7, 1]);
        expect(white[0]).toBeCloseTo(1, 6);
        expect(white[1]).toBeCloseTo(1, 6);
        expect(white[2]).toBeCloseTo(1, 6);

        const black = toSrgb('hsl', [0.2, 0.7, -1]);
        expect(black[0]).toBeCloseTo(0, 6);
        expect(black[1]).toBeCloseTo(0, 6);
        expect(black[2]).toBeCloseTo(0, 6);
    });

    it('hsl : teinte 0 donne le rouge pur', () => {
        const [r, g, b] = toSrgb('hsl', [-1, 1, 0]);
        expect(r).toBeCloseTo(1, 6);
        expect(g).toBeCloseTo(0, 6);
        expect(b).toBeCloseTo(0, 6);
    });

    it('oklab : bornes noir/blanc et gris au milieu', () => {
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

    it('oklch à chroma nulle égale oklab', () => {
        const oklch = toSrgb('oklch', [0.2, 0, 0.7]);
        const oklab = toSrgb('oklab', [0.2, 0, 0]);
        expect(oklch[0]).toBeCloseTo(oklab[0], 6);
        expect(oklch[1]).toBeCloseTo(oklab[1], 6);
        expect(oklch[2]).toBeCloseTo(oklab[2], 6);
    });

    it('plage : tout espace, toute combinaison de triplets, fini et dans [0, 1]', () => {
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
