import { deserializeGrammar, serializeGrammar } from '../artwork/index.ts';
import type { Catalog } from '../catalog/index.ts';
import { createSeed } from '../random/index.ts';
import type { Seed } from '../random/index.ts';
import {
    isNotebookRating,
    MAX_NOTEBOOK_FILE_LENGTH,
    NOTEBOOK_FILE_FORMAT,
    NOTEBOOK_FILE_VERSION,
} from './types.ts';
import type {
    Notebook,
    NotebookBatch,
    NotebookBatchData,
    NotebookCandidate,
    NotebookCandidateData,
    NotebookData,
    NotebookRecipe,
    NotebookRecipeData,
} from './types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
    record: Record<string, unknown>,
    allowed: readonly string[],
    path: string,
): void {
    for (const key of Object.keys(record)) {
        if (!allowed.includes(key)) {
            throw new Error(`${path}.${key}: unknown field`);
        }
    }
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

export function serializeCandidate(candidate: NotebookCandidate): NotebookCandidateData {
    return {
        id: candidate.id,
        grammar: serializeGrammar(candidate.grammar),
        seeds: candidate.seeds.map(Number),
        ...(candidate.rating !== undefined ? { rating: candidate.rating } : {}),
        ...(candidate.note !== undefined ? { note: candidate.note } : {}),
    };
}

export function serializeBatch(batch: NotebookBatch): NotebookBatchData {
    return {
        id: batch.id,
        createdAt: batch.createdAt,
        ...(batch.parentIds && batch.parentIds.length > 0 ? { parentIds: batch.parentIds } : {}),
        candidates: batch.candidates.map(serializeCandidate),
    };
}

export function serializeRecipe(recipe: NotebookRecipe): NotebookRecipeData {
    return {
        id: recipe.id,
        label: recipe.label,
        description: recipe.description,
        grammar: serializeGrammar(recipe.grammar),
        createdAt: recipe.createdAt,
        ...(recipe.candidateId !== undefined ? { candidateId: recipe.candidateId } : {}),
    };
}

export function serializeNotebookData(notebook: Notebook): NotebookData {
    return {
        format: NOTEBOOK_FILE_FORMAT,
        version: NOTEBOOK_FILE_VERSION,
        generatorVersion: notebook.generatorVersion,
        batches: notebook.batches.map(serializeBatch),
        recipes: notebook.recipes.map(serializeRecipe),
    };
}

/** Formatted JSON representation of a notebook (2-space indent, trailing newline). */
export function serializeNotebook(notebook: Notebook): string {
    return `${JSON.stringify(serializeNotebookData(notebook), null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Deserialization / Parsing
// ---------------------------------------------------------------------------

function readCandidate(catalog: Catalog, data: unknown, path: string): NotebookCandidate {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(data, ['id', 'grammar', 'seeds', 'rating', 'note'], path);

    if (typeof data.id !== 'string' || data.id.length === 0) {
        throw new Error(`${path}.id: non-empty string expected`);
    }

    if (data.grammar === undefined) {
        throw new Error(`${path}.grammar: object expected`);
    }

    const grammar = deserializeGrammar(catalog, data.grammar, `${path}.grammar`);

    if (!Array.isArray(data.seeds)) {
        throw new Error(`${path}.seeds: array expected`);
    }

    const seeds: Seed[] = [];
    for (let i = 0; i < data.seeds.length; i++) {
        const rawSeed = data.seeds[i];
        if (typeof rawSeed !== 'number') {
            throw new Error(`${path}.seeds[${i}]: number expected`);
        }
        seeds.push(createSeed(rawSeed));
    }

    let rating: NotebookCandidate['rating'];
    if (data.rating !== undefined) {
        if (!isNotebookRating(data.rating)) {
            throw new Error(`${path}.rating: integer between 0 and 5 expected`);
        }
        rating = data.rating;
    }

    if (data.note !== undefined && typeof data.note !== 'string') {
        throw new Error(`${path}.note: string expected`);
    }

    return {
        id: data.id,
        grammar,
        seeds,
        ...(rating !== undefined ? { rating } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
    };
}

function readBatch(catalog: Catalog, data: unknown, path: string): NotebookBatch {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(data, ['id', 'createdAt', 'parentIds', 'candidates'], path);

    if (typeof data.id !== 'string' || data.id.length === 0) {
        throw new Error(`${path}.id: non-empty string expected`);
    }

    if (typeof data.createdAt !== 'string') {
        throw new Error(`${path}.createdAt: string expected`);
    }

    let parentIds: string[] | undefined;
    if (data.parentIds !== undefined) {
        if (!Array.isArray(data.parentIds)) {
            throw new Error(`${path}.parentIds: array expected`);
        }
        parentIds = [];
        for (let i = 0; i < data.parentIds.length; i++) {
            const rawId = data.parentIds[i];
            if (typeof rawId !== 'string') {
                throw new Error(`${path}.parentIds[${i}]: string expected`);
            }
            parentIds.push(rawId);
        }
    }

    if (!Array.isArray(data.candidates)) {
        throw new Error(`${path}.candidates: array expected`);
    }

    const candidates = data.candidates.map((cand, index) =>
        readCandidate(catalog, cand, `${path}.candidates[${index}]`),
    );

    return {
        id: data.id,
        createdAt: data.createdAt,
        ...(parentIds && parentIds.length > 0 ? { parentIds } : {}),
        candidates,
    };
}

function readRecipe(catalog: Catalog, data: unknown, path: string): NotebookRecipe {
    if (!isRecord(data)) {
        throw new Error(`${path}: object expected`);
    }

    rejectUnknownKeys(
        data,
        ['id', 'label', 'description', 'grammar', 'createdAt', 'candidateId'],
        path,
    );

    if (typeof data.id !== 'string' || data.id.length === 0) {
        throw new Error(`${path}.id: non-empty string expected`);
    }

    if (typeof data.label !== 'string') {
        throw new Error(`${path}.label: string expected`);
    }

    if (typeof data.description !== 'string') {
        throw new Error(`${path}.description: string expected`);
    }

    if (data.grammar === undefined) {
        throw new Error(`${path}.grammar: object expected`);
    }

    const grammar = deserializeGrammar(catalog, data.grammar, `${path}.grammar`);

    if (typeof data.createdAt !== 'string') {
        throw new Error(`${path}.createdAt: string expected`);
    }

    if (data.candidateId !== undefined && typeof data.candidateId !== 'string') {
        throw new Error(`${path}.candidateId: string expected`);
    }

    return {
        id: data.id,
        label: data.label,
        description: data.description,
        grammar,
        createdAt: data.createdAt,
        ...(data.candidateId !== undefined ? { candidateId: data.candidateId } : {}),
    };
}

/** Parses and strictly validates a notebook JSON string. */
export function parseNotebook(catalog: Catalog, text: string): Notebook {
    if (text.length > MAX_NOTEBOOK_FILE_LENGTH) {
        throw new Error(
            `Notebook file too large (${text.length} characters, limit ${MAX_NOTEBOOK_FILE_LENGTH})`,
        );
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Notebook file: invalid JSON');
    }

    if (!isRecord(parsed)) {
        throw new Error('Notebook file: object expected');
    }

    rejectUnknownKeys(
        parsed,
        ['format', 'version', 'generatorVersion', 'batches', 'recipes'],
        'notebook',
    );

    if (parsed.format !== NOTEBOOK_FILE_FORMAT) {
        throw new Error(
            `Notebook file: format ${JSON.stringify(parsed.format)} not supported (expected "${NOTEBOOK_FILE_FORMAT}")`,
        );
    }

    if (parsed.version !== NOTEBOOK_FILE_VERSION) {
        throw new Error(`Notebook file: version ${String(parsed.version)} not supported`);
    }

    if (typeof parsed.generatorVersion !== 'number') {
        throw new Error('notebook.generatorVersion: number expected');
    }

    if (!Array.isArray(parsed.batches)) {
        throw new Error('notebook.batches: array expected');
    }

    if (!Array.isArray(parsed.recipes)) {
        throw new Error('notebook.recipes: array expected');
    }

    const batches = parsed.batches.map((batch, index) =>
        readBatch(catalog, batch, `notebook.batches[${index}]`),
    );

    const recipes = parsed.recipes.map((recipe, index) =>
        readRecipe(catalog, recipe, `notebook.recipes[${index}]`),
    );

    return {
        format: NOTEBOOK_FILE_FORMAT,
        version: NOTEBOOK_FILE_VERSION,
        generatorVersion: parsed.generatorVersion,
        batches,
        recipes,
    };
}
