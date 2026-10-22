import { GENERATOR_VERSION } from '../../core/generator/generator';
import type { Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/seed';
import { isNotebookRating, NOTEBOOK_FILE_FORMAT, NOTEBOOK_FILE_VERSION } from './types';
import type { Notebook, NotebookBatch, NotebookCandidate, NotebookRating } from './types';

let nextLocalId = 1;

/**
 * Generates a unique, readable ID with prefix. Used by UI (non-deterministic); generator never uses
 * it.
 */
function generateNotebookId(prefix: string): string {
    const time = Date.now().toString(36);
    const counter = (nextLocalId++).toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `${prefix}_${time}_${counter}_${random}`;
}

export interface CandidateInput {
    readonly id?: string;
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
    readonly rating?: NotebookRating;
    readonly note?: string;
}

export function createCandidate(input: CandidateInput): NotebookCandidate {
    if (input.rating !== undefined && !isNotebookRating(input.rating)) {
        throw new Error(`rating must be an integer between 0 and 5, received ${input.rating}`);
    }

    return {
        id: input.id ?? generateNotebookId('cand'),
        grammar: input.grammar,
        seeds: [...input.seeds],
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
    };
}

export interface BatchInput {
    readonly id?: string;
    readonly createdAt?: string;
    readonly parentIds?: readonly string[];
    readonly candidates: readonly NotebookCandidate[];
}

export function createBatch(input: BatchInput): NotebookBatch {
    return {
        id: input.id ?? generateNotebookId('batch'),
        createdAt: input.createdAt ?? new Date().toISOString(),
        ...(input.parentIds && input.parentIds.length > 0
            ? { parentIds: [...input.parentIds] }
            : {}),
        candidates: [...input.candidates],
    };
}

export interface NotebookInput {
    readonly generatorVersion?: number;
    readonly batches?: readonly NotebookBatch[];
}

export function createNotebook(input?: NotebookInput): Notebook {
    return {
        format: NOTEBOOK_FILE_FORMAT,
        version: NOTEBOOK_FILE_VERSION,
        generatorVersion: input?.generatorVersion ?? GENERATOR_VERSION,
        batches: input?.batches ? [...input.batches] : [],
    };
}

/** Updates a candidate's rating in a batch (immutable copy). */
export function updateCandidateRating(
    batch: NotebookBatch,
    candidateId: string,
    rating: NotebookRating | undefined,
): NotebookBatch {
    if (rating !== undefined && !isNotebookRating(rating)) {
        throw new Error(`rating must be an integer between 0 and 5, received ${rating}`);
    }

    return {
        ...batch,
        candidates: batch.candidates.map((candidate) => {
            if (candidate.id !== candidateId) {
                return candidate;
            }
            const copy = { ...candidate };
            if (rating === undefined) {
                delete copy.rating;
            } else {
                copy.rating = rating;
            }
            return copy;
        }),
    };
}

/** Updates a candidate's rating across the notebook. */
export function rateNotebookCandidate(
    notebook: Notebook,
    candidateId: string,
    rating: NotebookRating | undefined,
): Notebook {
    return {
        ...notebook,
        batches: notebook.batches.map((batch) =>
            batch.candidates.some((c) => c.id === candidateId)
                ? updateCandidateRating(batch, candidateId, rating)
                : batch,
        ),
    };
}

/** Appends a batch to a notebook. */
export function addBatchToNotebook(notebook: Notebook, batch: NotebookBatch): Notebook {
    return {
        ...notebook,
        batches: [batch, ...notebook.batches],
    };
}

/** Drops a batch (and its candidates) from the notebook. Unknown ids are a no-op. */
export function removeBatchFromNotebook(notebook: Notebook, batchId: string): Notebook {
    const batches = notebook.batches.filter((batch) => batch.id !== batchId);

    return batches.length === notebook.batches.length ? notebook : { ...notebook, batches };
}
