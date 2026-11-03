import { describe, expect, it } from 'vite-plus/test';

import { correlation } from './correlation';

describe('correlation', () => {
    it('is 1, -1 and 0 for the textbook cases, and 0 for a constant column', () => {
        expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
        expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1);
        expect(correlation([1, 2, 3], [5, 5, 5])).toBe(0);
    });
});
