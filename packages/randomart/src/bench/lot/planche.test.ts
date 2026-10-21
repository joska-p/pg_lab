import { describe, expect, it } from 'vite-plus/test';

import type { RgbImage } from '../../core/renderer/types';
import {
    assemblePlanche,
    fitGrid,
    PLANCHE_BACKGROUND,
    PLANCHE_DIM_FACTOR,
    plancheColumns,
} from './planche';

/** A solid image `size`x`size` filled with one RGB color. */
function solid(size: number, rgb: readonly [number, number, number]): RgbImage {
    const bytes = new Uint8Array(size * size * 3);

    for (let i = 0; i < size * size; i++) {
        bytes[i * 3] = rgb[0];
        bytes[i * 3 + 1] = rgb[1];
        bytes[i * 3 + 2] = rgb[2];
    }

    return { width: size, height: size, rgb: bytes };
}

function pixelAt(
    planche: ReturnType<typeof assemblePlanche>,
    x: number,
    y: number,
): readonly [number, number, number, number] {
    const at = (y * planche.width + x) * 4;

    return [planche.rgba[at], planche.rgba[at + 1], planche.rgba[at + 2], planche.rgba[at + 3]];
}

describe('fitGrid', () => {
    it('picks the squarest grid for a square box', () => {
        expect(fitGrid(36, 900, 900)).toBe(6);
    });

    it('goes wide in a wide box', () => {
        expect(fitGrid(36, 1200, 600)).toBe(9);
    });

    it('survives an unmeasured box', () => {
        expect(fitGrid(10, 0, 0)).toBe(10);
        expect(fitGrid(0, 100, 100)).toBe(1);
    });
});

describe('assemblePlanche', () => {
    it('sizes the grid from the number of rows and columns', () => {
        const red = solid(4, [255, 0, 0]);
        const planche = assemblePlanche(
            [
                [red, red, red],
                [red, red, red],
            ],
            4,
        );

        expect(planche.width).toBe(12);
        expect(planche.height).toBe(8);
        expect(planche.rgba.length).toBe(12 * 8 * 4);
    });

    it('places each cell at its grid position, opaque', () => {
        const red = solid(2, [255, 0, 0]);
        const blue = solid(2, [0, 0, 255]);
        // Row 0: red then empty; row 1: empty then blue.
        const planche = assemblePlanche(
            [
                [red, null],
                [null, blue],
            ],
            2,
        );

        expect(pixelAt(planche, 0, 0)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(planche, 2, 2)).toEqual([0, 0, 255, 255]);
        // Empty cells keep the background.
        expect(pixelAt(planche, 3, 0)).toEqual([...PLANCHE_BACKGROUND, 255]);
        expect(pixelAt(planche, 0, 3)).toEqual([...PLANCHE_BACKGROUND, 255]);
    });

    it('pads rows to the widest one', () => {
        const red = solid(2, [255, 0, 0]);
        const planche = assemblePlanche([[red, red, red], [red]], 2);

        expect(plancheColumns([[red, red, red], [red]])).toBe(3);
        expect(planche.width).toBe(6);
        // The short row's missing cells are background.
        expect(pixelAt(planche, 5, 3)).toEqual([...PLANCHE_BACKGROUND, 255]);
    });

    it('never produces a zero-sized image for an empty lot', () => {
        const planche = assemblePlanche([], 4);

        expect(planche.width).toBe(1);
        expect(planche.height).toBe(1);
        expect(planche.rgba.length).toBe(4);
    });

    it('dims flagged cells without moving them', () => {
        const white = solid(2, [200, 200, 200]);
        const planche = assemblePlanche([[white, white]], 2, {
            columns: 2,
            dim: [[true, false]],
        });

        // Same geometry as an undimmed grid: dimming must not punch a hole.
        expect(planche.width).toBe(4);
        expect(planche.height).toBe(2);
        // Dimmed cell: darker, at its own place. Untouched cell: untouched.
        expect(pixelAt(planche, 0, 0)).toEqual([
            Math.floor(200 * PLANCHE_DIM_FACTOR),
            Math.floor(200 * PLANCHE_DIM_FACTOR),
            Math.floor(200 * PLANCHE_DIM_FACTOR),
            255,
        ]);
        expect(pixelAt(planche, 2, 0)).toEqual([200, 200, 200, 255]);
    });

    it('uses explicit columns even when a row is short', () => {
        const red = solid(2, [255, 0, 0]);
        const planche = assemblePlanche([[red]], 2, { columns: 3 });

        expect(planche.width).toBe(6);
        expect(pixelAt(planche, 4, 0)).toEqual([...PLANCHE_BACKGROUND, 255]);
    });
});
