import type { GrammarData } from '../artwork/index.ts';
import type { Grammar } from '../grammar/index.ts';
import type { Seed } from '../random/index.ts';

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

/** A promoted grammar kept as a recipe for reuse or presets. */
export interface NotebookRecipe {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly grammar: Grammar;
    readonly createdAt: string;
    readonly candidateId?: string;
}

/** The notebook: persistent collection of evaluated batches and promoted recipes. */
export interface Notebook {
    readonly format: typeof NOTEBOOK_FILE_FORMAT;
    readonly version: typeof NOTEBOOK_FILE_VERSION;
    readonly generatorVersion: number;
    readonly batches: readonly NotebookBatch[];
    readonly recipes: readonly NotebookRecipe[];
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

export interface NotebookRecipeData {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly grammar: GrammarData;
    readonly createdAt: string;
    readonly candidateId?: string;
}

export interface NotebookData {
    readonly format: string;
    readonly version: number;
    readonly generatorVersion: number;
    readonly batches: readonly NotebookBatchData[];
    readonly recipes: readonly NotebookRecipeData[];
}
