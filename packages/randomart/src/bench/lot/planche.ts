import { PLANCHE_BACKGROUND, PLANCHE_DIM_FACTOR } from './constants';
import type { Planche, PlancheOptions, PlancheRow } from './types';

/** Widest row wins: a planche stays rectangular even when rows have different lengths. */
export function plancheColumns(rows: readonly PlancheRow[]): number {
    return rows.reduce((widest, row) => Math.max(widest, row.length), 0);
}

/**
 * Number of columns that maximizes the cell size when `count` square cells are laid out in a
 * `width` × `height` box.
 */
export function fitGrid(count: number, width: number, height: number): number {
    if (count <= 0 || width <= 0 || height <= 0) {
        return Math.max(1, count);
    }

    let best = 1;
    let bestCell = 0;

    for (let columns = 1; columns <= count; columns++) {
        const rows = Math.ceil(count / columns);
        const cell = Math.min(width / columns, height / rows);

        if (cell > bestCell) {
            bestCell = cell;
            best = columns;
        }
    }

    return best;
}

/**
 * Assembles the grid in memory — the whole planche is **one** image, so the display needs **one**
 * `putImageData` and **one** canvas (never a canvas per cell, the WebGL context budget forbids it).
 * Images are copied as-is, top-left aligned; a cell larger than `cellSize` is cropped, a smaller
 * one leaves the background showing.
 */
export function assemblePlanche(
    rows: readonly PlancheRow[],
    cellSize: number,
    { columns = plancheColumns(rows), dim }: PlancheOptions = {},
): Planche {
    const width = Math.max(1, columns * cellSize);
    const height = Math.max(1, rows.length * cellSize);
    const rgba = new Uint8ClampedArray(width * height * 4);
    const [br, bg, bb] = PLANCHE_BACKGROUND;

    for (let i = 0; i < width * height; i++) {
        rgba[i * 4] = br;
        rgba[i * 4 + 1] = bg;
        rgba[i * 4 + 2] = bb;
        rgba[i * 4 + 3] = 255;
    }

    rows.forEach((row, rowIndex) => {
        row.forEach((image, columnIndex) => {
            if (!image) {
                return;
            }

            const factor = dim?.[rowIndex]?.[columnIndex] ? PLANCHE_DIM_FACTOR : 1;
            const copyWidth = Math.min(image.width, cellSize);
            const copyHeight = Math.min(image.height, cellSize);

            for (let y = 0; y < copyHeight; y++) {
                const from = y * image.width * 3;
                const to = ((rowIndex * cellSize + y) * width + columnIndex * cellSize) * 4;

                for (let x = 0; x < copyWidth; x++) {
                    rgba[to + x * 4] = image.rgb[from + x * 3] * factor;
                    rgba[to + x * 4 + 1] = image.rgb[from + x * 3 + 1] * factor;
                    rgba[to + x * 4 + 2] = image.rgb[from + x * 3 + 2] * factor;
                }
            }
        });
    });

    return { width, height, rgba };
}
