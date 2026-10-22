import type { RgbImage } from '../../core/renderer/types';

/**
 * One displayed cell: a rendered image, or `null` when the render failed (the slot is kept so the
 * grid never moves). A row is one grammar, its columns are its seeds — the planche is the
 * render-side twin of `sampleGrammars` (one line per grammar).
 */
export type PlancheCell = RgbImage | null;

export type PlancheRow = readonly PlancheCell[];

export interface Planche {
    readonly width: number;
    readonly height: number;
    /** RGBA bytes, rows top to bottom: the exact payload of `new ImageData(rgba, width, height)`. */
    readonly rgba: Uint8ClampedArray;
}

export interface PlancheOptions {
    /** Explicit column count (a grid must not depend on which rows happen to be full). */
    readonly columns?: number;
    /** Per-cell flags, same shape as `rows`: a flagged cell is painted dimmed. */
    readonly dim?: readonly (readonly boolean[])[];
}

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
