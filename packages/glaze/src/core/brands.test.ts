import { describe, expect, it } from 'vite-plus/test';

import {
    createPositiveInteger,
    createPositiveNumber,
    isPositiveInteger,
    isPositiveNumber,
} from './brands';

describe('positive number brand', () => {
    it('accepts finite values above zero', () => {
        expect(createPositiveNumber(0.5)).toBe(0.5);
        expect(isPositiveNumber(1)).toBe(true);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (value) => {
        expect(() => createPositiveNumber(value)).toThrow(/strictly positive/);
        expect(isPositiveNumber(value)).toBe(false);
    });
});

describe('positive integer brand', () => {
    it('accepts integers above zero', () => {
        expect(createPositiveInteger(1)).toBe(1);
        expect(isPositiveInteger(42)).toBe(true);
    });

    it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (value) => {
        expect(() => createPositiveInteger(value)).toThrow(/strictly positive integer/);
        expect(isPositiveInteger(value)).toBe(false);
    });
});
