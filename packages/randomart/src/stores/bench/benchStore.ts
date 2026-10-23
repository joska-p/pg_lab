import { create } from 'zustand';

import { buildLotView } from '../../bench/lot/lot';
import type { LotView } from '../../bench/lot/types';
import { EMPTY_LOT } from '../../bench/lot/view';
import {
    createBatch,
    createCandidate,
    addBatchToNotebook,
    removeBatchFromNotebook,
} from '../../bench/notebook/notebook';
import { parseNotebook, serializeNotebook } from '../../bench/notebook/serialize';
import type { NotebookBatch, NotebookRating, Notebook } from '../../bench/notebook/types';
import { CONFIG } from '../../core/config/config';
import { sampleGrammars } from '../../core/grammar/sample';
import type { Grammar } from '../../core/grammar/types';
import { randomSeed } from '../../core/random/seed';
import type { Seed } from '../../core/random/types';
import { createBatchRenderer } from '../../core/renderer/batchRenderer';
import type { BatchRenderer, RenderedBatch } from '../../core/renderer/types';
import type { BenchSettings, BenchView, CellSize } from './types';

export const CELL_SIZES = ['64', '128', '256'] as const satisfies readonly CellSize[];
export const MAX_BENCH_COUNT = 32;
export const MAX_BENCH_SEEDS = 64;
export const BENCH_VIEWS = ['focus', 'planche'] as const satisfies readonly BenchView[];
export const MIN_RATING = 0;
export const MAX_RATING = 5;

const DEFAULT_SETTINGS: BenchSettings = {
    count: 12,
    seedsPerGrammar: CONFIG.sampling.benchSeedsPerGrammar,
    cellSize: '128',
    view: 'focus',
    dimFlats: false,
    baseSeed: randomSeed(),
};

interface BenchState {
    // Lot state
    selectedRowIndex: number;
    selectedColIndex: number;
    lot: LotView;
    error: string | null;

    // Notebook state
    notebook: Notebook;
    activeBatchId: string | null;

    // Settings
    settings: BenchSettings;

    // Internal (not exposed via hooks)
    _renderer: BatchRenderer | null;
    _openInLabHandler: ((grammar: Grammar, seed: Seed) => void) | null;
}

const initialNotebook: Notebook = {
    format: 'randomart-notebook',
    version: 1,
    generatorVersion: 1,
    batches: [],
};

const store = create<BenchState>(() => ({
    selectedRowIndex: 0,
    selectedColIndex: 0,
    lot: EMPTY_LOT,
    error: null,
    notebook: initialNotebook,
    activeBatchId: null,
    settings: DEFAULT_SETTINGS,
    _renderer: null,
    _openInLabHandler: null,
}));

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

// Internal: get or create renderer
function getRenderer(state: BenchState): BatchRenderer {
    if (!state._renderer) {
        state._renderer = createBatchRenderer();
    }
    return state._renderer;
}

// Internal: build error state and clear renderer
function buildErrorState(cause: unknown) {
    return {
        lot: EMPTY_LOT,
        error: cause instanceof Error ? cause.message : String(cause),
        _renderer: null,
    };
}

// Internal: render batch candidates
function renderBatchCandidates(
    batch: NotebookBatch,
    cellSize: number,
    state: BenchState,
): readonly RenderedBatch[] {
    const renderer = getRenderer(state);
    return renderer.render(
        batch.candidates.map(({ grammar, seeds }) => ({ grammar, seeds })),
        cellSize,
    );
}

// Internal: persist notebook to DB
async function persistNotebook(notebook: Notebook): Promise<void> {
    try {
        const { saveNotebookToDb } = await import('../../bench/storage/notebookDb');
        await saveNotebookToDb(notebook);
    } catch {
        // Persistence failure is non-fatal
    }
}

// Internal: load notebook from DB
async function loadPersistedNotebook(): Promise<Notebook | null> {
    try {
        const { loadNotebookFromDb } = await import('../../bench/storage/notebookDb');
        return await loadNotebookFromDb();
    } catch {
        return null;
    }
}

// Internal: add batch to notebook and persist
function addBatchToNotebookState(notebook: Notebook, batch: NotebookBatch): Notebook {
    return addBatchToNotebook(notebook, batch);
}

// Internal: remove batch from notebook and persist
function removeBatchFromNotebookState(notebook: Notebook, batchId: string): Notebook {
    return removeBatchFromNotebook(notebook, batchId);
}

// Public hooks
export function useBenchSelectedRowIndex(): number {
    return store((state) => state.selectedRowIndex);
}

export function useBenchSelectedColIndex(): number {
    return store((state) => state.selectedColIndex);
}

export function useBenchLot(): LotView {
    return store((state) => state.lot);
}

export function useBenchError(): string | null {
    return store((state) => state.error);
}

export function useBenchSettings(): BenchSettings {
    return store((state) => state.settings);
}

export function useBenchNotebook(): Notebook {
    return store((state) => state.notebook);
}

export function useBenchActiveBatchId(): string | null {
    return store((state) => state.activeBatchId);
}

export function useBenchActiveBatch(): NotebookBatch | undefined {
    return store((state) => {
        const { notebook, activeBatchId } = state;
        if (!activeBatchId) {
            return notebook.batches[0];
        }
        return notebook.batches.find((b) => b.id === activeBatchId);
    });
}

export function useBenchView(): BenchView {
    return store((state) => state.settings.view);
}

export function useBenchCellSize(): CellSize {
    return store((state) => state.settings.cellSize);
}

export function useBenchCount(): number {
    return store((state) => state.settings.count);
}

export function useBenchSeedsPerGrammar(): number {
    return store((state) => state.settings.seedsPerGrammar);
}

export function useBenchDimFlats(): boolean {
    return store((state) => state.settings.dimFlats);
}

export function useBenchBaseSeed(): Seed {
    return store((state) => state.settings.baseSeed);
}

// Settings mutations
function patchSettings(patch: Partial<BenchSettings>): void {
    store.setState((state) => ({ settings: { ...state.settings, ...patch } }));
}

export function setBenchCount(count: number): void {
    patchSettings({ count });
}

export function setBenchSeeds(seedsPerGrammar: number): void {
    patchSettings({ seedsPerGrammar });
}

export function setBenchCellSize(cellSize: CellSize): void {
    patchSettings({ cellSize });
}

export function setBenchView(view: BenchView): void {
    patchSettings({ view });
}

export function setBenchDimFlats(dimFlats: boolean): void {
    patchSettings({ dimFlats });
}

export function setBenchBaseSeed(baseSeed: Seed): void {
    patchSettings({ baseSeed });
}

export function resetBenchBaseSeed(): void {
    patchSettings({ baseSeed: randomSeed() });
}

// Open in Lab handler
export function setOpenInLabHandler(
    handler: ((grammar: Grammar, seed: Seed) => void) | null,
): void {
    store.setState({ _openInLabHandler: handler });
}

// Lot actions
export function selectCell(rowIndex: number, colIndex: number): void {
    const state = store.getState();
    const lastRow = Math.max(0, state.lot.grammarCount - 1);
    const lastCol = Math.max(
        0,
        (state.lot.rows[Math.min(lastRow, Math.max(0, rowIndex))]?.length ?? 1) - 1,
    );

    store.setState({
        selectedRowIndex: Math.min(lastRow, Math.max(0, rowIndex)),
        selectedColIndex: Math.min(lastCol, Math.max(0, colIndex)),
    });
}

export function stepRow(delta: number): void {
    const { selectedRowIndex, lot } = store.getState();
    const last = Math.max(0, lot.grammarCount - 1);

    store.setState({ selectedRowIndex: Math.min(last, Math.max(0, selectedRowIndex + delta)) });
}

export function stepCell(delta: number): void {
    const { selectedColIndex, lot } = store.getState();
    const last = Math.max(0, lot.columnCount - 1);

    store.setState({ selectedColIndex: Math.min(last, Math.max(0, selectedColIndex + delta)) });
}

export function drawBenchBatch(): void {
    const baseSeed = randomSeed();
    setBenchBaseSeed(baseSeed);

    try {
        const { count, seedsPerGrammar, cellSize } = store.getState().settings;

        const sampled = sampleGrammars(count, { baseSeed, seedsPerGrammar });

        const candidates = sampled.map(({ grammar, seeds }) => createCandidate({ grammar, seeds }));
        const batch = createBatch({ candidates });

        const state = store.getState();
        const lot = buildLotView(renderBatchCandidates(batch, Number(cellSize), state));

        const nextNotebook = addBatchToNotebookState(state.notebook, batch);

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
            notebook: nextNotebook,
            activeBatchId: batch.id,
        });

        persistNotebook(nextNotebook);
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function redrawBench(): void {
    const state = store.getState();
    const activeBatch =
        state.notebook.batches.find((b) => b.id === state.activeBatchId) ??
        state.notebook.batches[0];

    if (!activeBatch) {
        drawBenchBatch();
        return;
    }

    try {
        const { cellSize } = state.settings;
        const lot = buildLotView(renderBatchCandidates(activeBatch, Number(cellSize), state));

        store.setState({ lot, error: null });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function selectBatch(batchId: string): void {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === batchId);

    if (!activeBatch) {
        return;
    }

    try {
        const { cellSize } = state.settings;
        const lot = buildLotView(renderBatchCandidates(activeBatch, Number(cellSize), state));

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
            activeBatchId: batchId,
        });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function removeActiveBatch(): void {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === state.activeBatchId);

    if (!activeBatch) {
        return;
    }

    const nextNotebook = removeBatchFromNotebookState(state.notebook, activeBatch.id);
    const next = nextNotebook.batches[0];

    if (next) {
        const { cellSize } = state.settings;
        const lot = buildLotView(renderBatchCandidates(next, Number(cellSize), state));

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
            notebook: nextNotebook,
            activeBatchId: next.id,
        });
    } else {
        store.setState({
            lot: EMPTY_LOT,
            selectedRowIndex: 0,
            selectedColIndex: 0,
            notebook: nextNotebook,
            activeBatchId: null,
        });
    }

    persistNotebook(nextNotebook);
}

export function rateCandidateRow(rowIndex: number, rating: NotebookRating | undefined): void {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === state.activeBatchId);

    if (!activeBatch) {
        return;
    }

    const candidate = activeBatch.candidates[rowIndex];

    if (!candidate) {
        return;
    }

    const nextNotebook = {
        ...state.notebook,
        batches: state.notebook.batches.map((b) =>
            b.id === activeBatch.id
                ? {
                      ...b,
                      candidates: b.candidates.map((c) =>
                          c.id === candidate.id ? { ...c, rating } : c,
                      ),
                  }
                : b,
        ),
    };

    store.setState({ notebook: nextNotebook });
    persistNotebook(nextNotebook);
}

export function toggleCandidateRating(rowIndex: number, rating: NotebookRating): void {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === state.activeBatchId);
    const candidate = activeBatch?.candidates[rowIndex];

    rateCandidateRow(rowIndex, candidate?.rating === rating ? undefined : rating);
}

export async function importNotebook(file: File): Promise<void> {
    try {
        const text = await file.text();
        const notebook = parseNotebook(text);
        const firstBatch = notebook.batches[0];

        let lot: LotView = EMPTY_LOT;
        if (firstBatch) {
            const state = store.getState();
            lot = buildLotView(
                renderBatchCandidates(firstBatch, Number(state.settings.cellSize), state),
            );
        }

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
            notebook,
            activeBatchId: notebook.batches[0]?.id ?? null,
        });

        await persistNotebook(notebook);
    } catch (cause) {
        store.setState({
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

export function exportNotebookFile(): void {
    const notebook = store.getState().notebook;
    const text = serializeNotebook(notebook);
    const blob = new Blob([text], { type: 'application/json' });

    downloadBlob(blob, 'randomart-notebook.json');
}

/** Restores the persisted notebook and draws its active batch, if any. */
export async function initBench(): Promise<void> {
    const loaded = await loadPersistedNotebook();

    if (!loaded || loaded.batches.length === 0) {
        return;
    }

    const activeBatch = loaded.batches[0];
    if (!activeBatch) {
        return;
    }

    try {
        const state = store.getState();
        const lot = buildLotView(
            renderBatchCandidates(activeBatch, Number(state.settings.cellSize), state),
        );

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
            notebook: loaded,
            activeBatchId: activeBatch.id,
        });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function openSelectedInLab(): void {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === state.activeBatchId);

    if (!activeBatch) {
        return;
    }

    const candidate = activeBatch.candidates[state.selectedRowIndex];

    if (!candidate) {
        return;
    }

    const seed = candidate.seeds[state.selectedColIndex] ?? candidate.seeds[0];

    if (seed === undefined) {
        return;
    }

    state._openInLabHandler?.(candidate.grammar, seed);
}
