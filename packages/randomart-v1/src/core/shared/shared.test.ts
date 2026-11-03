import { describe, expect, it } from 'vite-plus/test';

import { assertFinite, assertInteger, assertIntegerInRange } from './shared';

describe('assertFinite', () => {
    it('accepts finite numbers', () => {
        expect(() => assertFinite(0, 'val')).not.toThrow();
        expect(() => assertFinite(42, 'val')).not.toThrow();
        expect(() => assertFinite(-123.45, 'val')).not.toThrow();
    });

    it('rejects non-finite numbers with a `Randomart:`-prefixed message', () => {
        expect(() => assertFinite(Number.NaN, 'val')).toThrow(
            'Randomart: val must be a finite number, received NaN',
        );
        expect(() => assertFinite(Number.POSITIVE_INFINITY, 'val')).toThrow(
            'Randomart: val must be a finite number, received Infinity',
        );
        expect(() => assertFinite(Number.NEGATIVE_INFINITY, 'val')).toThrow(
            'Randomart: val must be a finite number, received -Infinity',
        );
    });
});

describe('assertInteger', () => {
    it('accepts integers (including 0 and negatives)', () => {
        expect(() => assertInteger(0, 'val')).not.toThrow();
        expect(() => assertInteger(-12, 'val')).not.toThrow();
        expect(() => assertInteger(9_999, 'val')).not.toThrow();
    });

    it('rejects non-integers and non-finite values', () => {
        expect(() => assertInteger(1.5, 'val')).toThrow(
            'Randomart: val must be an integer, received 1.5',
        );
        expect(() => assertInteger(Number.NaN, 'val')).toThrow(
            'Randomart: val must be a finite number, received NaN',
        );
    });
});

describe('assertIntegerInRange', () => {
    it('accepts integers inside the closed range', () => {
        expect(() => assertIntegerInRange(1, 'x.y', 1, 16)).not.toThrow();
        expect(() => assertIntegerInRange(16, 'x.y', 1, 16)).not.toThrow();
        expect(() => assertIntegerInRange(-5, 'x.y', -5, -1)).not.toThrow();
    });

    it('rejects out-of-range integers with one message naming both bounds', () => {
        expect(() => assertIntegerInRange(0, 'x.y', 1, 16)).toThrow(
            'Randomart: x.y must be an integer in [1, 16], received 0',
        );
        expect(() => assertIntegerInRange(17, 'x.y', 1, 16)).toThrow(
            'Randomart: x.y must be an integer in [1, 16], received 17',
        );
    });

    it('routes non-finite values to the finite check first', () => {
        expect(() => assertIntegerInRange(Number.POSITIVE_INFINITY, 'x.y', 1, 16)).toThrow(
            'Randomart: x.y must be a finite number, received Infinity',
        );
        expect(() => assertIntegerInRange(Number.NaN, 'x.y', 1, 16)).toThrow(/finite/);
    });
});
