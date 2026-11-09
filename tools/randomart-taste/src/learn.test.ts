import { describe, expect, it } from 'vite-plus/test';

import { learn, printResults, ridgeRegression } from './learn';

describe('learn', () => {
    it('regresses operator features onto visual features on the generated dataset', () => {
        const results = learn({
            input: '../data/samples.json',
            lambda: 0.01,
            topN: 12,
        });

        printResults(results, 12);

        expect(results).toHaveLength(6);
        for (const res of results) {
            console.log(`${res.target}: R² = ${res.r2.toFixed(3)}`);
            expect(res.r2).toBeGreaterThanOrEqual(0);
            expect(res.r2).toBeLessThanOrEqual(1);
            expect(Number.isFinite(res.intercept)).toBe(true);
            for (const coef of Object.values(res.coef)) {
                expect(Number.isFinite(coef)).toBe(true);
            }
        }
    });
});

describe('ridgeRegression', () => {
    it('recovers the slope of a single-feature linear signal', () => {
        const n = 200;
        const X: number[][] = [];
        const y: number[] = [];
        for (let i = 0; i < n; i++) {
            const x = i / (n - 1);
            X.push([x]);
            y.push(2 * x + 0.05 * Math.sin(i * 1.7));
        }

        const { coef, intercept } = ridgeRegression(X, y, 0.01);
        const slope = coef[0] ?? Number.NaN;

        expect(Number.isFinite(slope)).toBe(true);
        expect(slope).toBeCloseTo(2, 1);
        expect(Number.isFinite(intercept)).toBe(true);
    });
});
