import type { LotView } from './types';

/** The lot before anything has been drawn. */
export const EMPTY_LOT = {
    rows: [],
    flat: [],
    columnCount: 0,
    grammarCount: 0,
    cellCount: 0,
    failedCount: 0,
    flatCount: 0,
} as const satisfies LotView;
