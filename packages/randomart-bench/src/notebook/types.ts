import type { GrammarData } from '@repo/randomart-core/artwork/serialize';
import type { Grammar } from '@repo/randomart-core/grammar/types';
import type { Seed } from '@repo/randomart-core/random/seed';

export const NOTEBOOK_FILE_FORMAT = 'randomart-notebook';
export const NOTEBOOK_FILE_VERSION = 1;
/** Import guard: checked before any `JSON.parse`. */
export const MAX_NOTEBOOK_FILE_LENGTH = 10_000_000;

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

/** One candidate grammar evaluated across several seeds. */
export interface NotebookCandidate {
    readonly id: string;
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
    readonly rating?: NotebookRating;
    readonly note?: string;
}

/** A generation or draw of candidate grammars (one row per candidate). */
export interface NotebookBatch {
    readonly id: string;
    readonly createdAt: string;
    readonly parentIds?: readonly string[];
    readonly candidates: readonly NotebookCandidate[];
}

/** The notebook: persistent collection of evaluated batches. */
export interface Notebook {
    readonly format: typeof NOTEBOOK_FILE_FORMAT;
    readonly version: typeof NOTEBOOK_FILE_VERSION;
    readonly generatorVersion: number;
    readonly batches: readonly NotebookBatch[];
}

// ---------------------------------------------------------------------------
// Serialized shapes (plain JSON representations)
// ---------------------------------------------------------------------------

export interface NotebookCandidateData {
    readonly id: string;
    readonly grammar: GrammarData;
    readonly seeds: readonly number[];
    readonly rating?: number;
    readonly note?: string;
}

export interface NotebookBatchData {
    readonly id: string;
    readonly createdAt: string;
    readonly parentIds?: readonly string[];
    readonly candidates: readonly NotebookCandidateData[];
}

export interface NotebookData {
    readonly format: string;
    readonly version: number;
    readonly generatorVersion: number;
    readonly batches: readonly NotebookBatchData[];
}
