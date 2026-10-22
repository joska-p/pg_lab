/** Notebook file format constants. */
export const NOTEBOOK_FILE_FORMAT = 'randomart-notebook';
export const NOTEBOOK_FILE_VERSION = 1;
/** Import guard: checked before any `JSON.parse`. */
export const MAX_NOTEBOOK_FILE_LENGTH = 10_000_000;

/** Rating bounds and type guard. */
export const MIN_RATING = 0;
export const MAX_RATING = 5;
export type NotebookRating = 0 | 1 | 2 | 3 | 4 | 5;

export function isNotebookRating(value: unknown): value is NotebookRating {
    return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= MIN_RATING &&
        value <= MAX_RATING
    );
}
