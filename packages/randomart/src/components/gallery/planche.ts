import type { RgbImage } from '../../core/analysis/index.ts';

/**
 * One displayed cell: a rendered image, or `null` when the cell is empty (a failed render, or a
 * candidate hidden by the flat filter). A row is one grammar, its columns are its seeds — the
 * planche is the render-side twin of `sampleGrammars` (one line per grammar).
 */
export type PlancheCell = RgbImage | null;
export type PlancheRow = readonly PlancheCell[];

/** Background of the planche (empty cells and padding), a neutral near-black. */
export const PLANCHE_BACKGROUND: readonly [number, number, number] = [16, 16, 22];

export interface Planche {
    readonly width: number;
    readonly height: number;
    /** RGBA bytes, rows top to bottom: the exact payload of `new ImageData(rgba, width, height)`. */
    readonly rgba: Uint8ClampedArray;
}

/** Widest row wins: a planche stays rectangular even when rows have different lengths. */
export function plancheColumns(rows: readonly PlancheRow[]): number {
    return rows.reduce((widest, row) => Math.max(widest, row.length), 0);
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
    columns = plancheColumns(rows),
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

            const copyWidth = Math.min(image.width, cellSize);
            const copyHeight = Math.min(image.height, cellSize);

            for (let y = 0; y < copyHeight; y++) {
                const from = y * image.width * 3;
                const to = ((rowIndex * cellSize + y) * width + columnIndex * cellSize) * 4;

                for (let x = 0; x < copyWidth; x++) {
                    rgba[to + x * 4] = image.rgb[from + x * 3];
                    rgba[to + x * 4 + 1] = image.rgb[from + x * 3 + 1];
                    rgba[to + x * 4 + 2] = image.rgb[from + x * 3 + 2];
                }
            }
        });
    });

    return { width, height, rgba };
}
