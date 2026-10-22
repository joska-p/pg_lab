import type { GrammarData, Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/types';

/** A discrete rating; its bounds live in `./constants` next to the values they are derived from. */
export type NotebookRating = 0 | 1 | 2 | 3 | 4 | 5;

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
    readonly format: string;
    readonly version: number;
    readonly generatorVersion: number;
    readonly batches: readonly NotebookBatch[];
}

/** Raw candidate fields accepted by `createCandidate`; ids and copies are filled in. */
export interface CandidateInput {
    readonly id?: string;
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
    readonly rating?: NotebookRating;
    readonly note?: string;
}

/** Raw batch fields accepted by `createBatch`; ids and timestamps are filled in. */
export interface BatchInput {
    readonly id?: string;
    readonly createdAt?: string;
    readonly parentIds?: readonly string[];
    readonly candidates: readonly NotebookCandidate[];
}

/** Raw notebook fields accepted by `createNotebook`; format and version are filled in. */
export interface NotebookInput {
    readonly generatorVersion?: number;
    readonly batches?: readonly NotebookBatch[];
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
