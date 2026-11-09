import { describe, expect, it } from 'vite-plus/test';

import { ridgeRegression } from './ridge';

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
