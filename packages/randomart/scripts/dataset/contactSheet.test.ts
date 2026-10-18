import { describe, expect, it } from 'vite-plus/test';

import { buildContactSheet } from './contactSheet.ts';
import { fakeDataset } from './testing.ts';

describe('buildContactSheet', () => {
    it('lays one row of seeds per selected grammar', () => {
        const dataset = fakeDataset({ count: 4, seeds: 3, size: 2 });
        const sheet = buildContactSheet(dataset, { start: 1, rows: 2 });

        expect(sheet.indices).toEqual([1, 2]);
        expect(sheet.width).toBe(3 * 2);
        expect(sheet.height).toBe(2 * 2);
    });

    it('places each image at its own cell', () => {
        const dataset = fakeDataset({ count: 4, seeds: 3, size: 2 });
        const sheet = buildContactSheet(dataset, { start: 1, rows: 2 });

        // Row 1 is grammar 2, column 2 is seed 2: image (2, 2) is filled with the byte 34.
        expect(sheet.rgb[0]).toBe((1 * 16 + 0) & 0xff);
        expect(sheet.rgb[((1 * 2 + 0) * sheet.width + 2 * 2) * 3]).toBe((2 * 16 + 2) & 0xff);
    });

    it('takes an explicit grammar list over start/rows', () => {
        const sheet = buildContactSheet(fakeDataset({ count: 4, seeds: 3, size: 2 }), {
            grammars: [3],
        });

        expect(sheet.indices).toEqual([3]);
        expect(sheet.height).toBe(2);
    });

    it('refuses to draw an empty sheet', () => {
        expect(() => buildContactSheet(fakeDataset({ count: 0 }), {})).toThrow(/no grammar/);
    });
});
