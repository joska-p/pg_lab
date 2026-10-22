import { MAX_RATING, MIN_RATING } from './constants';
import type { NotebookRating } from './types';

export function isNotebookRating(value: unknown): value is NotebookRating {
    return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= MIN_RATING &&
        value <= MAX_RATING
    );
}
