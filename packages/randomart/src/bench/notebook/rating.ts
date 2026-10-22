import { MAX_RATING, MIN_RATING } from './constants';

/** A discrete rating; its bounds live in `./constants` next to the values they are derived from. */
export type NotebookRating = 0 | 1 | 2 | 3 | 4 | 5;

export function isNotebookRating(value: unknown): value is NotebookRating {
    return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= MIN_RATING &&
        value <= MAX_RATING
    );
}
