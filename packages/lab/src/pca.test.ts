import { describe, expect, it } from 'vite-plus/test';

import { correlation, jacobiEigen, pca } from './pca.ts';

describe('jacobiEigen', () => {
    it('finds the eigenvalues of a known 2x2', () => {
        const { values } = jacobiEigen([
            [2, 1],
            [1, 2],
        ]);

        expect(values[0]).toBeCloseTo(3);
        expect(values[1]).toBeCloseTo(1);
    });

    it('returns orthonormal eigenvectors that satisfy A v = lambda v', () => {
        const a = [
            [4, 1, 0.5],
            [1, 3, 0.2],
            [0.5, 0.2, 1],
        ];
        const { values, vectors } = jacobiEigen(a);

        vectors.forEach((vec, k) => {
            expect(vec.reduce((s, x) => s + x * x, 0)).toBeCloseTo(1);

            a.forEach((row, i) => {
                expect(row.reduce((s, x, j) => s + x * vec[j], 0)).toBeCloseTo(values[k] * vec[i]);
            });
        });
    });
});

describe('pca', () => {
    it('puts two perfectly correlated columns on a single component', () => {
        const rows = Array.from({ length: 20 }, (_, i) => [i, 2 * i + 1, Math.sin(i * 7)]);
        const result = pca(rows.map(([a, b]) => [a, b]));

        expect(result.explained[0]).toBeCloseTo(1);
        expect(result.explained[1]).toBeCloseTo(0);
    });

    it('explained variance sums to 1 and scores are centred', () => {
        const rows = Array.from({ length: 30 }, (_, i) => [
            Math.sin(i),
            Math.cos(i * 1.3),
            (i % 5) + Math.sin(i * 2),
        ]);
        const result = pca(rows);

        expect(result.explained.reduce((s, x) => s + x, 0)).toBeCloseTo(1);

        for (let k = 0; k < 3; k++) {
            const mean = result.scores.reduce((s, row) => s + row[k], 0) / rows.length;

            expect(mean).toBeCloseTo(0);
        }
    });

    it('rejects a constant column', () => {
        expect(() =>
            pca([
                [1, 5],
                [2, 5],
                [3, 5],
            ]),
        ).toThrow(/constant/);
    });
});

describe('correlation', () => {
    it('is 1, -1 and 0 for the textbook cases, and 0 for a constant column', () => {
        expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
        expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1);
        expect(correlation([1, 2, 3], [5, 5, 5])).toBe(0);
    });
});
