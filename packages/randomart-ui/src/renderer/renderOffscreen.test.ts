import { describe, expect, it } from 'vite-plus/test';

import { clampExportSize } from './renderOffscreen';

describe('clampExportSize', () => {
    it('returns the request when within limits', () => {
        expect(clampExportSize(2048, [16384, 16384])).toBe(2048);
    });

    it('caps to the smallest limit', () => {
        expect(clampExportSize(2048, [1024, 4096])).toBe(1024);
        expect(clampExportSize(2048, [4096, 1024])).toBe(1024);
    });

    it('is at least 1', () => {
        expect(clampExportSize(0.2, [4096, 4096])).toBe(1);
    });

    it('floors the request', () => {
        expect(clampExportSize(2048.9, [4096, 4096])).toBe(2048);
    });
});
