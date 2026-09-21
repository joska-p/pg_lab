import { describe, expect, it } from 'vite-plus/test';

import { XRAY_LUT } from './lut';

describe('XRAY_LUT', () => {
    it('holds 256 RGB entries', () => {
        expect(XRAY_LUT).toBeInstanceOf(Uint8Array);
        expect(XRAY_LUT).toHaveLength(256 * 3);
    });

    it('starts deep blue and ends white', () => {
        expect([XRAY_LUT[0], XRAY_LUT[1], XRAY_LUT[2]]).toEqual([3, 4, 18]);
        expect([XRAY_LUT[255 * 3], XRAY_LUT[255 * 3 + 1], XRAY_LUT[255 * 3 + 2]]).toEqual([
            255, 255, 255,
        ]);
    });

    it('stays within byte range', () => {
        for (const v of XRAY_LUT) expect(v).toBeGreaterThanOrEqual(0);
        for (const v of XRAY_LUT) expect(v).toBeLessThanOrEqual(255);
    });
});
