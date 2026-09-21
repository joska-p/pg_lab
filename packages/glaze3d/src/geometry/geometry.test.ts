import { describe, expect, it } from 'vite-plus/test';

import { toIndexArray } from './geometry';

describe('toIndexArray', () => {
    it('uses Uint16 by default and Uint32 past 65536 vertices', () => {
        expect(toIndexArray(3, [0, 1, 2])).toBeInstanceOf(Uint16Array);
        expect(toIndexArray(65536, [0, 1, 2])).toBeInstanceOf(Uint16Array);
        expect(toIndexArray(65537, [0, 1, 2])).toBeInstanceOf(Uint32Array);
    });
});
