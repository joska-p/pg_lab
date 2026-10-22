/** One row of grammars: the drawn lot, one line per grammar. */
import type { PlancheRow } from './types';

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

/** The lot before anything has been drawn. */
export const EMPTY_LOT: LotView = {
    rows: [],
    flat: [],
    columnCount: 0,
    grammarCount: 0,
    cellCount: 0,
    failedCount: 0,
    flatCount: 0,
};
