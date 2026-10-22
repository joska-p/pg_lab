import type { RenderedBatch } from '../../core/renderer/batch/batch';
import { flatShareOf } from '../../core/renderer/flatness';
import type { RgbImage } from '../../core/renderer/types';
import { plancheColumns } from './planche';
import type { PlancheRow, PlancheCell } from './planche';

/** Flat block share threshold above which a grammar is considered collapsed. */
const FLAT_SHARE_THRESHOLD = 0.9;

export function isFlat(image: RgbImage, threshold = FLAT_SHARE_THRESHOLD): boolean {
    return flatShareOf(image) >= threshold;
}

/**
 * Drawn lot ready for display: planche rows + flags/counters (single representation;
 * RenderedBatch[] produces it).
 */
export interface LotView {
    /** One row per grammar, one column per seed. `null` = the render failed for that cell. */
    readonly rows: readonly PlancheRow[];
    /** Flat flags, same shape as `rows` (a failed cell is never flat). */
    readonly flat: readonly (readonly boolean[])[];
    /** Column count of the grid: the widest row, so a hole never shifts a column. */
    readonly columnCount: number;
    /** Number of grammars drawn: one candidate per row. */
    readonly grammarCount: number;
    readonly cellCount: number;
    readonly failedCount: number;
    readonly flatCount: number;
}

export const EMPTY_LOT: LotView = {
    rows: [],
    flat: [],
    columnCount: 0,
    grammarCount: 0,
    cellCount: 0,
    failedCount: 0,
    flatCount: 0,
};

/**
 * Builds display lot from rendered batches. Pure. Failed renders keep null slot (grid stable); flat
 * cells flagged, not hidden.
 */
export function buildLotView(batches: readonly RenderedBatch[]): LotView {
    const rows: PlancheRow[] = [];
    const flat: boolean[][] = [];
    let cells = 0;
    let failed = 0;
    let flats = 0;

    for (const batch of batches) {
        const rowCells: (RgbImage | null)[] = [];
        const rowFlat: boolean[] = [];

        for (const cell of batch.cells) {
            cells++;

            if (!cell.image) {
                failed++;
                rowCells.push(null);
                rowFlat.push(false);
                continue;
            }

            const cellIsFlat = isFlat(cell.image);

            if (cellIsFlat) {
                flats++;
            }

            rowCells.push(cell.image);
            rowFlat.push(cellIsFlat);
        }

        rows.push(rowCells);
        flat.push(rowFlat);
    }

    return {
        rows,
        flat,
        columnCount: plancheColumns(rows),
        grammarCount: rows.length,
        cellCount: cells,
        failedCount: failed,
        flatCount: flats,
    };
}

/** Focus view: one grammar's seeds re-flowed into `columns`-wide grid. Returns plain LotView. */
export function focusLotView(lot: LotView, rowIndex: number, columns: number): LotView {
    const cells = lot.rows[rowIndex] ?? [];
    const flags = lot.flat[rowIndex] ?? [];
    const width = Math.max(1, Math.min(columns, cells.length));
    const rows: PlancheCell[][] = [];
    const flat: boolean[][] = [];

    for (let start = 0; start < cells.length; start += width) {
        rows.push(cells.slice(start, start + width));
        flat.push(flags.slice(start, start + width));
    }

    return {
        rows,
        flat,
        columnCount: width,
        grammarCount: rows.length,
        cellCount: cells.length,
        failedCount: cells.filter((cell) => cell === null).length,
        flatCount: flags.filter(Boolean).length,
    };
}
