import { describe, expect, it } from 'vite-plus/test';

import {
    FF,
    FF_DATA,
    FF_N,
    FF_SYMS,
    FF_TBL,
    MAX_ATOMS_DESKTOP,
    MAX_ATOMS_MOBILE,
    Q_MAX,
    Q_MIN,
    ff,
    maxAtoms,
} from './formFactors';

describe('formFactors', () => {
    it('covers H through Xe (54 elements, 9 coefficients each)', () => {
        expect(FF_SYMS).toHaveLength(54);
        expect(FF_SYMS[0]).toBe('H');
        expect(FF_SYMS[53]).toBe('Xe');
        expect(FF_DATA).toHaveLength(54);
        for (const row of FF_DATA) {
            expect(row).toHaveLength(9);
        }
        expect(FF.C).toBe(FF_DATA[5]);
    });

    it('builds a 128-entry lookup table per element', () => {
        expect(FF_TBL.C).toHaveLength(FF_N);
        expect(Object.keys(FF_TBL)).toHaveLength(54);
    });

    it('matches the atomic number at q -> 0 (sum a_i + c = Z)', () => {
        // C: 2.31+1.02+1.5886+0.865+0.2156 = 5.9992 ~= 6.
        expect(ff('C', Q_MIN)).toBeCloseTo(6, 1);
        // H: 0.489918+0.262003+0.196767+0.049879+0.001305 ~= 1.
        expect(ff('H', Q_MIN)).toBeCloseTo(1, 2);
    });

    it('decays with q and stays positive', () => {
        const lo = ff('C', Q_MIN);
        const hi = ff('C', Q_MAX);
        expect(hi).toBeLessThan(lo);
        expect(hi).toBeGreaterThan(0);
    });

    it('clamps q outside [Q_MIN, Q_MAX] to the table edges', () => {
        expect(ff('C', -50)).toBe(FF_TBL.C[0]);
        expect(ff('C', 1e6)).toBe(FF_TBL.C[FF_N - 1]);
    });

    it('throws on elements without form factors', () => {
        expect(() => ff('Xx', 1)).toThrow(/no form factors/);
    });

    it('exposes mobile/desktop atom budgets', () => {
        expect(MAX_ATOMS_MOBILE).toBe(16);
        expect(MAX_ATOMS_DESKTOP).toBe(60);
        expect(maxAtoms(true)).toBe(16);
        expect(maxAtoms(false)).toBe(60);
    });
});
