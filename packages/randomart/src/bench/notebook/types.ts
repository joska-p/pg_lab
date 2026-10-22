import type { GrammarData, Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/types';
import {
    NOTEBOOK_FILE_FORMAT,
    NOTEBOOK_FILE_VERSION,
    MIN_RATING,
    MAX_RATING,
    MAX_NOTEBOOK_FILE_LENGTH,
    isNotebookRating,
} from './constants';
import type { NotebookRating } from './constants';

// Re-export for backward compatibility
export {
    NOTEBOOK_FILE_FORMAT,
    NOTEBOOK_FILE_VERSION,
    MIN_RATING,
    MAX_RATING,
    MAX_NOTEBOOK_FILE_LENGTH,
    isNotebookRating,
    type NotebookRating,
};

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
