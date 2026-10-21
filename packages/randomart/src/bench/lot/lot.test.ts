import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../../core/catalog/Catalog';
import { defaultGrammar } from '../../core/grammar/presets';
import type { RenderedBatch } from '../../core/renderer/batch/batch';
import type { RgbImage } from '../../core/renderer/types';
import { buildLotView, EMPTY_LOT, isFlat } from './lot';

const catalog = createDefaultCatalog();
const grammar = defaultGrammar(catalog);

/** A flat image: every block has zero variance, so the grammar has collapsed. */
function solid(size: number, level: number): RgbImage {
    const rgb = new Uint8Array(size * size * 3);

    rgb.fill(level);

    return { width: size, height: size, rgb };
}

/** A gradient: every block varies, so the cell is not flat. */
function gradient(size: number): RgbImage {
    const rgb = new Uint8Array(size * size * 3);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const value = Math.round((255 * (x + y)) / (2 * (size - 1)));

            rgb[(y * size + x) * 3] = value;
            rgb[(y * size + x) * 3 + 1] = value;
            rgb[(y * size + x) * 3 + 2] = value;
        }
    }

    return { width: size, height: size, rgb };
}

function batch(cells: readonly (RgbImage | null)[]): RenderedBatch {
    return {
        grammar,
        cells: cells.map((image) => ({ error: image ? null : 'render refused', image })),
    };
}

describe('isFlat', () => {
    it('separates a constant field from a varying one', () => {
        expect(isFlat(solid(16, 128))).toBe(true);
        expect(isFlat(gradient(16))).toBe(false);
    });
});

describe('buildLotView', () => {
    it('returns an empty lot for no batches', () => {
        expect(buildLotView([])).toEqual(EMPTY_LOT);
    });

    it('sizes the grid from the batches and keeps the counter honest', () => {
        const lot = buildLotView([
            batch([gradient(16), gradient(16), gradient(16)]),
            batch([gradient(16), gradient(16), gradient(16)]),
        ]);

        expect(lot.grammarCount).toBe(2);
        expect(lot.columnCount).toBe(3);
        expect(lot.cellCount).toBe(6);
        expect(lot.failedCount).toBe(0);
        expect(lot.flatCount).toBe(0);
    });

    it('keeps a failed render in its slot so the grid never shifts', () => {
        const lot = buildLotView([batch([gradient(16), null, gradient(16)])]);

        expect(lot.cellCount).toBe(3);
        expect(lot.failedCount).toBe(1);
        expect(lot.columnCount).toBe(3);
        expect(lot.rows[0]?.[1]).toBeNull();
        expect(lot.flat[0]?.[1]).toBe(false);
    });

    it('flags a flat cell instead of dropping it', () => {
        const flat = solid(16, 200);
        const lot = buildLotView([batch([flat, gradient(16)])]);

        expect(lot.flatCount).toBe(1);
        expect(lot.rows[0]?.[0]).toBe(flat);
        expect(lot.flat[0]?.[0]).toBe(true);
        expect(lot.flat[0]?.[1]).toBe(false);
    });

    it('pads the grid to the widest row', () => {
        const lot = buildLotView([batch([gradient(16), gradient(16)]), batch([gradient(16)])]);

        expect(lot.columnCount).toBe(2);
        expect(lot.rows[1]).toHaveLength(1);
        expect(lot.flat[1]).toHaveLength(1);
    });
});
