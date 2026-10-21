import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../../core/catalog/Catalog';
import { grammarPresets } from '../../core/grammar/presets';
import { createSeed } from '../../core/random/seed';
import {
    addBatchToNotebook,
    createBatch,
    createCandidate,
    createNotebook,
    rateNotebookCandidate,
    removeBatchFromNotebook,
    updateCandidateRating,
} from './notebook';
import { parseNotebook, serializeNotebook } from './serialize';
import {
    isNotebookRating,
    MAX_NOTEBOOK_FILE_LENGTH,
    NOTEBOOK_FILE_FORMAT,
    NOTEBOOK_FILE_VERSION,
} from './types';

describe('notebook core', () => {
    const catalog = createDefaultCatalog();
    const grammar = grammarPresets(catalog)[0].grammar;
    const seeds = [createSeed(42), createSeed(43)];

    describe('types and validation', () => {
        it('validates ratings in [0, 5]', () => {
            expect(isNotebookRating(0)).toBe(true);
            expect(isNotebookRating(3)).toBe(true);
            expect(isNotebookRating(5)).toBe(true);

            expect(isNotebookRating(-1)).toBe(false);
            expect(isNotebookRating(6)).toBe(false);
            expect(isNotebookRating(2.5)).toBe(false);
            expect(isNotebookRating('3')).toBe(false);
            expect(isNotebookRating(null)).toBe(false);
            expect(isNotebookRating(undefined)).toBe(false);
        });

        it('creates a candidate and checks rating bounds', () => {
            const cand = createCandidate({
                grammar,
                seeds,
                rating: 4,
                note: 'Interesting pattern',
            });
            expect(cand.rating).toBe(4);
            expect(cand.note).toBe('Interesting pattern');
            expect(cand.seeds).toHaveLength(2);

            expect(() =>
                createCandidate({
                    grammar,
                    seeds,
                    // @ts-expect-error testing invalid rating
                    rating: 99,
                }),
            ).toThrow(/rating must be an integer between 0 and 5/);
        });

        it('updates ratings immutably', () => {
            const cand1 = createCandidate({ id: 'c1', grammar, seeds, rating: 2 });
            const cand2 = createCandidate({ id: 'c2', grammar, seeds });
            const batch = createBatch({ id: 'b1', candidates: [cand1, cand2] });

            const updated = updateCandidateRating(batch, 'c1', 5);
            expect(updated.candidates[0]?.rating).toBe(5);
            expect(batch.candidates[0]?.rating).toBe(2);

            const cleared = updateCandidateRating(updated, 'c1', undefined);
            expect(cleared.candidates[0]?.rating).toBeUndefined();

            const notebook = createNotebook({ batches: [batch] });
            const ratedNotebook = rateNotebookCandidate(notebook, 'c2', 3);
            expect(ratedNotebook.batches[0]?.candidates[1]?.rating).toBe(3);
        });

        it('adds a batch to a notebook', () => {
            const initial = createNotebook();
            expect(initial.batches).toHaveLength(0);

            const batch = createBatch({
                candidates: [createCandidate({ grammar, seeds })],
            });

            const withBatch = addBatchToNotebook(initial, batch);

            expect(withBatch.batches).toHaveLength(1);
        });

        it('drops a batch by id and leaves the notebook untouched when the id is unknown', () => {
            const first = createBatch({
                id: 'batch-1',
                candidates: [createCandidate({ grammar, seeds, rating: 5 })],
            });
            const second = createBatch({
                id: 'batch-2',
                candidates: [createCandidate({ grammar, seeds })],
            });
            const notebook = addBatchToNotebook(
                addBatchToNotebook(createNotebook(), first),
                second,
            );

            const withoutFirst = removeBatchFromNotebook(notebook, 'batch-1');

            expect(withoutFirst.batches.map((batch) => batch.id)).toEqual(['batch-2']);
            // Unknown ids are a no-op, not an empty notebook.
            expect(removeBatchFromNotebook(notebook, 'nope')).toBe(notebook);
        });
    });

    describe('serialization and parsing', () => {
        it('round-trips a complete notebook', () => {
            const candidate1 = createCandidate({
                id: 'cand-1',
                grammar,
                seeds,
                rating: 5,
                note: 'Excellent structure',
            });
            const candidate2 = createCandidate({
                id: 'cand-2',
                grammar,
                seeds: [createSeed(100)],
            });
            const batch = createBatch({
                id: 'batch-1',
                createdAt: '2026-10-17T20:00:00.000Z',
                parentIds: ['parent-0'],
                candidates: [candidate1, candidate2],
            });

            const original = createNotebook({
                generatorVersion: 3,
                batches: [batch],
            });

            const serialized = serializeNotebook(original);
            expect(serialized.endsWith('\n')).toBe(true);

            const parsed = parseNotebook(catalog, serialized);
            expect(parsed.format).toBe(NOTEBOOK_FILE_FORMAT);
            expect(parsed.version).toBe(NOTEBOOK_FILE_VERSION);
            expect(parsed.generatorVersion).toBe(3);
            expect(parsed.batches).toHaveLength(1);
            expect(parsed.batches[0]?.id).toBe('batch-1');
            expect(parsed.batches[0]?.parentIds).toEqual(['parent-0']);
            expect(parsed.batches[0]?.candidates).toHaveLength(2);
            expect(parsed.batches[0]?.candidates[0]?.rating).toBe(5);
            expect(parsed.batches[0]?.candidates[0]?.note).toBe('Excellent structure');
            expect(parsed.batches[0]?.candidates[1]?.rating).toBeUndefined();
        });

        it('rejects files exceeding MAX_NOTEBOOK_FILE_LENGTH', () => {
            const oversized = ' '.repeat(MAX_NOTEBOOK_FILE_LENGTH + 1);
            expect(() => parseNotebook(catalog, oversized)).toThrow(/too large/);
        });

        it('rejects invalid JSON', () => {
            expect(() => parseNotebook(catalog, '{not json')).toThrow(/invalid JSON/);
        });

        it('rejects unexpected format or version', () => {
            const badFormat = JSON.stringify({
                format: 'unknown-format',
                version: 1,
                generatorVersion: 1,
                batches: [],
            });
            expect(() => parseNotebook(catalog, badFormat)).toThrow(/format.*not supported/);

            const badVersion = JSON.stringify({
                format: NOTEBOOK_FILE_FORMAT,
                version: 99,
                generatorVersion: 1,
                batches: [],
            });
            expect(() => parseNotebook(catalog, badVersion)).toThrow(/version.*not supported/);
        });

        it('rejects unknown fields in notebook, batch, and candidate', () => {
            const withUnknownRoot = JSON.stringify({
                format: NOTEBOOK_FILE_FORMAT,
                version: 1,
                generatorVersion: 1,
                batches: [],
                extraRootField: true,
            });
            expect(() => parseNotebook(catalog, withUnknownRoot)).toThrow(
                /notebook\.extraRootField: unknown field/,
            );

            const cand = createCandidate({ id: 'c1', grammar, seeds });
            const batch = createBatch({ id: 'b1', candidates: [cand] });
            const nb = createNotebook({ batches: [batch] });
            const raw = JSON.parse(serializeNotebook(nb));

            raw.batches[0].candidates[0].hackedField = 123;
            expect(() => parseNotebook(catalog, JSON.stringify(raw))).toThrow(
                /notebook\.batches\[0\]\.candidates\[0\]\.hackedField: unknown field/,
            );
        });

        it('rejects invalid rating values in parsed JSON', () => {
            const cand = createCandidate({ id: 'c1', grammar, seeds, rating: 3 });
            const batch = createBatch({ id: 'b1', candidates: [cand] });
            const nb = createNotebook({ batches: [batch] });
            const raw = JSON.parse(serializeNotebook(nb));

            raw.batches[0].candidates[0].rating = 8;
            expect(() => parseNotebook(catalog, JSON.stringify(raw))).toThrow(
                /notebook\.batches\[0\]\.candidates\[0\]\.rating: integer between 0 and 5 expected/,
            );
        });
    });
});
