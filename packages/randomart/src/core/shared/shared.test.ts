import { describe, expect, it } from 'vite-plus/test';

import { assertFinite } from './index.ts';

describe('assertFinite', () => {
    it('accepts finite numbers', () => {
        expect(() => assertFinite(0, 'val')).not.toThrow();
        expect(() => assertFinite(42, 'val')).not.toThrow();
        expect(() => assertFinite(-123.45, 'val')).not.toThrow();
    });

    it('rejects non-finite numbers with a descriptive error', () => {
        expect(() => assertFinite(Number.NaN, 'val')).toThrow(/val must be a finite number/);
        expect(() => assertFinite(Number.POSITIVE_INFINITY, 'val')).toThrow(
            /val must be a finite number/,
        );
        expect(() => assertFinite(Number.NEGATIVE_INFINITY, 'val')).toThrow(
            /val must be a finite number/,
        );
    });
});
