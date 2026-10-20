import { create } from 'zustand';

import { CONFIG } from '../../core/config/config';
import { sampleGrammars } from '../../core/grammar/sample';
import {
    addBatchToNotebook,
    createBatch,
    createCandidate,
    createNotebook,
    rateNotebookCandidate,
    removeBatchFromNotebook,
} from '../../core/notebook/notebook';
import { parseNotebook, serializeNotebook } from '../../core/notebook/serialize';
import type { Notebook, NotebookBatch, NotebookRating } from '../../core/notebook/types';
import type { Seed } from '../../core/random/seed';
import { createSeed, randomSeed } from '../../core/random/seed';
import { createBatchRenderer } from '../../renderer/batch/batch';
import type { BatchRenderer, RenderedBatch } from '../../renderer/batch/batch';
import { loadNotebookFromDb, saveNotebookToDb } from '../../storage/notebookDb';
import { buildLotView, EMPTY_LOT } from '../components/bench/lot';
import type { LotView } from '../components/bench/lot';
import { openCellInLab } from './appStore';
import { catalog } from './catalogStore';

/** Cell sizes offered: square powers of two ≥ 16, so the analysis descriptors accept them. */
export type CellSize = '64' | '128' | '256';
export const CELL_SIZES = ['64', '128', '256'] as const satisfies readonly CellSize[];

export const MAX_BENCH_COUNT = 32;
export const MAX_BENCH_SEEDS = 64;

/**
 * How the lot is presented. `planche` is the contact sheet: every grammar, fitted to the stage.
 * `focus` is one grammar at native cell size — the regime where a single candidate is actually
 * judged.
 */
export type BenchView = 'focus' | 'planche';
export const BENCH_VIEWS = ['focus', 'planche'] as const satisfies readonly BenchView[];

/**
 * Everything that describes _which_ lot to draw and _how_ to show it. Editable in the panel, read
 * by the render action: one master copy, no duplication between the panel and the stage.
 */
export interface BenchSettings {
    readonly count: number;
    readonly seedsPerGrammar: number;
    readonly cellSize: CellSize;
    readonly view: BenchView;
    readonly dimFlats: boolean;
    readonly baseSeed: Seed;
}

const DEFAULT_SETTINGS: BenchSettings = {
    count: 12,
    seedsPerGrammar: CONFIG.sampling.benchSeedsPerGrammar,
    cellSize: '128',
    view: 'focus',
    dimFlats: false,
    baseSeed: createSeed(CONFIG.sampling.baseSeed),
};

interface BenchState {
    settings: BenchSettings;
    notebook: Notebook;
    activeBatchId: string | null;
    selectedRowIndex: number;
    selectedColIndex: number;
    lot: LotView;
    error: string | null;
}

/**
 * The bench's domain: the lot and how it is drawn. Separate from `appStore` (the workspace: current
 * grammar, expression, history) because the two do not share write authority — the panel edits the
 * lot, the stage shows it, `appStore` never sees it.
 */
const store = create<BenchState>(() => ({
    settings: DEFAULT_SETTINGS,
    notebook: createNotebook(),
    activeBatchId: null,
    selectedRowIndex: 0,
    selectedColIndex: 0,
    lot: EMPTY_LOT,
    error: null,
}));

export function useBenchSettings(): BenchSettings {
    return store((state) => state.settings);
}

export function useBenchNotebook(): Notebook {
    return store((state) => state.notebook);
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

/**
 * Moves the current grammar. Navigation clamps at both ends: a lot is a finite list to walk
 * through, not a carousel that silently jumps back to the top.
 */
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

export function selectCell(rowIndex: number, colIndex: number): void {
    const { lot } = store.getState();
    const lastRow = Math.max(0, lot.grammarCount - 1);
    const lastCol = Math.max(
        0,
        (lot.rows[Math.min(lastRow, Math.max(0, rowIndex))]?.length ?? 1) - 1,
    );

    store.setState({
        selectedRowIndex: Math.min(lastRow, Math.max(0, rowIndex)),
        selectedColIndex: Math.min(lastCol, Math.max(0, colIndex)),
    });
}

/**
 * The offscreen surface of `renderer/batch.ts`, owned by this store: created with the first lot and
 * kept for the app's lifetime, so every lot reuses **one** WebGL context.
 */
let renderer: BatchRenderer | null = null;

function renderBatchCandidates(batch: NotebookBatch, cellSize: number): readonly RenderedBatch[] {
    renderer ??= createBatchRenderer(catalog);
    return renderer.render(
        batch.candidates.map(({ grammar, seeds }) => ({ grammar, seeds })),
        cellSize,
    );
}

function buildErrorState(cause: unknown) {
    renderer?.destroy();
    renderer = null;

    return {
        lot: EMPTY_LOT,
        error: cause instanceof Error ? cause.message : String(cause),
    };
}

function resolveActiveBatch(state: BenchState): NotebookBatch | undefined {
    return (
        state.notebook.batches.find((batch) => batch.id === state.activeBatchId) ??
        state.notebook.batches[0]
    );
}

function renderNewLot(base: Seed): void {
    const { count, seedsPerGrammar, cellSize } = store.getState().settings;

    try {
        const sampled = sampleGrammars(catalog, count, { baseSeed: base, seedsPerGrammar });

        const candidates = sampled.map(({ grammar, seeds }) => createCandidate({ grammar, seeds }));
        const batch = createBatch({ candidates });

        const lot = buildLotView(renderBatchCandidates(batch, Number(cellSize)));

        const nextNotebook = addBatchToNotebook(store.getState().notebook, batch);

        store.setState({
            notebook: nextNotebook,
            activeBatchId: batch.id,
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
        });

        void saveNotebookToDb(nextNotebook);
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function drawBenchBatch(): void {
    const baseSeed = randomSeed();

    store.setState((state) => ({ settings: { ...state.settings, baseSeed } }));
    renderNewLot(baseSeed);
}

export function redrawBench(): void {
    const state = store.getState();
    const activeBatch = resolveActiveBatch(state);

    if (!activeBatch) {
        renderNewLot(state.settings.baseSeed);
        return;
    }

    try {
        const lot = buildLotView(
            renderBatchCandidates(activeBatch, Number(state.settings.cellSize)),
        );

        store.setState({ lot, error: null });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function selectBatch(batchId: string): void {
    const state = store.getState();
    const batch = state.notebook.batches.find((b) => b.id === batchId);

    if (!batch) {
        return;
    }

    try {
        const lot = buildLotView(renderBatchCandidates(batch, Number(state.settings.cellSize)));

        store.setState({
            activeBatchId: batchId,
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
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

    const nextNotebook = removeBatchFromNotebook(state.notebook, activeBatch.id);
    const next = nextNotebook.batches[0];

    store.setState({ notebook: nextNotebook, activeBatchId: next?.id ?? null });
    void saveNotebookToDb(nextNotebook);

    if (next) {
        selectBatch(next.id);
    } else {
        store.setState({ lot: EMPTY_LOT, selectedRowIndex: 0, selectedColIndex: 0 });
    }
}

export function rateCandidateRow(rowIndex: number, rating: NotebookRating | undefined): void {
    const state = store.getState();
    const activeBatch = resolveActiveBatch(state);

    if (!activeBatch) {
        return;
    }

    const candidate = activeBatch.candidates[rowIndex];

    if (!candidate) {
        return;
    }

    const updatedNotebook = rateNotebookCandidate(state.notebook, candidate.id, rating);

    store.setState({ notebook: updatedNotebook });
    void saveNotebookToDb(updatedNotebook);
}

/** Toggles the current grammar's rating: rating it twice with the same value clears it. */
export function toggleCandidateRating(rowIndex: number, rating: NotebookRating): void {
    const state = store.getState();
    const candidate = resolveActiveBatch(state)?.candidates[rowIndex];

    rateCandidateRow(rowIndex, candidate?.rating === rating ? undefined : rating);
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function exportNotebookFile(): void {
    const notebook = store.getState().notebook;
    const text = serializeNotebook(notebook);
    const blob = new Blob([text], { type: 'application/json' });

    downloadBlob(blob, 'randomart-notebook.json');
}

export async function importNotebookFile(file: File): Promise<void> {
    const text = await file.text();

    try {
        const notebook = parseNotebook(catalog, text);

        store.setState({
            notebook,
            activeBatchId: notebook.batches[0]?.id ?? null,
            selectedRowIndex: 0,
            selectedColIndex: 0,
            error: null,
        });
        void saveNotebookToDb(notebook);

        const firstBatch = notebook.batches[0];

        if (firstBatch) {
            const lot = buildLotView(
                renderBatchCandidates(firstBatch, Number(store.getState().settings.cellSize)),
            );

            store.setState({ lot });
        } else {
            store.setState({ lot: EMPTY_LOT });
        }
    } catch (cause) {
        store.setState({
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/**
 * Opens the selected cell (grammar + seed) in Lab mode. It reuses the app's own artwork pipeline,
 * so nothing is invented here: the bench hands the pair over and leaves.
 */
export function openSelectedInLab(): void {
    const state = store.getState();
    const activeBatch = resolveActiveBatch(state);

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

    openCellInLab(candidate.grammar, seed);
}

export async function initBenchNotebook(): Promise<void> {
    try {
        const loaded = await loadNotebookFromDb(catalog);

        if (loaded && loaded.batches.length > 0) {
            const activeBatch = loaded.batches[0];

            if (!activeBatch) {
                return;
            }

            const lot = buildLotView(
                renderBatchCandidates(activeBatch, Number(store.getState().settings.cellSize)),
            );

            store.setState({
                notebook: loaded,
                activeBatchId: activeBatch.id,
                lot,
            });
        }
    } catch {
        // Fallback to empty notebook on storage error
    }
}
