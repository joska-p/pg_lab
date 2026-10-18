import { create } from 'zustand';

import { DEFAULT_CHANNELS } from '../core/color/index.ts';
import { sampleGrammars } from '../core/grammar/index.ts';
import {
    addBatchToNotebook,
    createBatch,
    createCandidate,
    createNotebook,
    parseNotebook,
    rateNotebookCandidate,
    serializeNotebook,
} from '../core/notebook/index.ts';
import type { Notebook, NotebookBatch, NotebookRating } from '../core/notebook/index.ts';
import type { Seed } from '../core/random/index.ts';
import { createSeed, randomSeed } from '../core/random/index.ts';
import { createBatchRenderer } from '../renderer/index.ts';
import type { BatchRenderer, RenderedBatch } from '../renderer/index.ts';
import { loadNotebookFromDb, saveNotebookToDb } from '../storage/notebookDb.ts';
import { openCellInLab } from './appStore.ts';
import { catalog } from './catalogueStore.ts';

/** Cell sizes offered: square powers of two ≥ 16, so the analysis descriptors accept them. */
export type CellSize = '32' | '64' | '128';

export const CELL_SIZES = ['32', '64', '128'] as const satisfies readonly CellSize[];

export const MAX_GALLERY_COUNT = 16;
export const MAX_GALLERY_SEEDS = 16;

/**
 * Everything that describes _which_ lot to draw. Editable in the panel, read by the render action:
 * one master copy, no duplication between the panel and the stage.
 */
export interface GallerySettings {
    /** Number of candidate grammars: one row each. */
    readonly count: number;
    /** Images per grammar: one column each. */
    readonly seedsPerGrammar: number;
    readonly cellSize: CellSize;
    readonly filterFlats: boolean;
    /** Base of the sampling draw: the lot is reproducible from it. */
    readonly baseSeed: Seed;
}

const DEFAULT_SETTINGS: GallerySettings = {
    count: 8,
    seedsPerGrammar: 8,
    cellSize: '64',
    filterFlats: false,
    baseSeed: createSeed(1),
};

interface GalleryState {
    settings: GallerySettings;
    notebook: Notebook;
    activeBatchId: string | null;
    selectedRowIndex: number;
    selectedCell: { rowIndex: number; colIndex: number } | null;
    /** The rendered lot for the active batch. Empty until the first "New batch". */
    batches: readonly RenderedBatch[];
    /** Message of the last failed lot, null after a success. */
    error: string | null;
}

/**
 * The gallery's domain: the lot and how it is drawn. Separate from `appStore` (the workspace:
 * current grammar, expression, history) because the two do not share write authority — the panel
 * edits the lot, the stage shows it, `appStore` never sees it.
 */
export const store = create<GalleryState>(() => ({
    settings: DEFAULT_SETTINGS,
    notebook: createNotebook(),
    activeBatchId: null,
    selectedRowIndex: 0,
    selectedCell: null,
    batches: [],
    error: null,
}));

export function useGallerySettings(): GallerySettings {
    return store((state) => state.settings);
}

export function useGalleryNotebook(): Notebook {
    return store((state) => state.notebook);
}

export function useGalleryActiveBatch(): NotebookBatch | undefined {
    return store((state) => {
        const { notebook, activeBatchId } = state;
        if (!activeBatchId) {
            return notebook.batches[0];
        }
        return notebook.batches.find((b) => b.id === activeBatchId);
    });
}

export function useGallerySelectedRowIndex(): number {
    return store((state) => state.selectedRowIndex);
}

export function useGallerySelectedCell(): { rowIndex: number; colIndex: number } | null {
    return store((state) => state.selectedCell);
}

export function useGalleryBatches(): readonly RenderedBatch[] {
    return store((state) => state.batches);
}

export function useGalleryError(): string | null {
    return store((state) => state.error);
}

function patchSettings(patch: Partial<GallerySettings>): void {
    store.setState((state) => ({ settings: { ...state.settings, ...patch } }));
}

export function setGalleryCount(count: number): void {
    patchSettings({ count });
}

export function setGallerySeeds(seedsPerGrammar: number): void {
    patchSettings({ seedsPerGrammar });
}

export function setGalleryCellSize(cellSize: CellSize): void {
    patchSettings({ cellSize });
}

export function setGalleryFilterFlats(filterFlats: boolean): void {
    patchSettings({ filterFlats });
}

export function setSelectedRowIndex(selectedRowIndex: number): void {
    store.setState({ selectedRowIndex });
}

export function setSelectedCell(selectedCell: { rowIndex: number; colIndex: number } | null): void {
    store.setState({
        selectedCell,
        ...(selectedCell ? { selectedRowIndex: selectedCell.rowIndex } : {}),
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

/** Draws and renders a new batch, appending it to the notebook. */
function renderNewLot(base: Seed): void {
    const { count, seedsPerGrammar, cellSize } = store.getState().settings;

    try {
        const sampled = sampleGrammars(catalog, count, {
            baseSeed: base,
            seedsPerGrammar,
            channels: DEFAULT_CHANNELS,
        });

        const candidates = sampled.map(({ grammar, seeds }) => createCandidate({ grammar, seeds }));
        const batch = createBatch({ candidates });

        const renderedBatches = renderBatchCandidates(batch, Number(cellSize));

        const nextNotebook = addBatchToNotebook(store.getState().notebook, batch);

        store.setState({
            notebook: nextNotebook,
            activeBatchId: batch.id,
            selectedRowIndex: 0,
            selectedCell: null,
            batches: renderedBatches,
            error: null,
        });

        void saveNotebookToDb(nextNotebook);
    } catch (cause) {
        renderer?.destroy();
        renderer = null;
        store.setState({
            batches: [],
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** "New batch": draws fresh candidate grammars and appends them to the notebook. */
export function newGalleryBatch(): void {
    const baseSeed = randomSeed();

    store.setState((state) => ({ settings: { ...state.settings, baseSeed } }));
    renderNewLot(baseSeed);
}

/** "Redraw": redraws the current active batch at the current cell size. */
export function redrawGallery(): void {
    const state = store.getState();
    const activeBatch =
        state.notebook.batches.find((b) => b.id === state.activeBatchId) ??
        state.notebook.batches[0];

    if (!activeBatch) {
        renderNewLot(state.settings.baseSeed);
        return;
    }

    try {
        const rendered = renderBatchCandidates(activeBatch, Number(state.settings.cellSize));
        store.setState({ batches: rendered, error: null });
    } catch (cause) {
        renderer?.destroy();
        renderer = null;
        store.setState({
            batches: [],
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** Selects an existing batch from the notebook to view on the planche. */
export function selectBatch(batchId: string): void {
    const state = store.getState();
    const batch = state.notebook.batches.find((b) => b.id === batchId);
    if (!batch) {
        return;
    }

    try {
        const rendered = renderBatchCandidates(batch, Number(state.settings.cellSize));
        store.setState({
            activeBatchId: batchId,
            batches: rendered,
            selectedRowIndex: 0,
            selectedCell: null,
            error: null,
        });
    } catch (cause) {
        renderer?.destroy();
        renderer = null;
        store.setState({
            batches: [],
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** Rates a candidate row in the active batch (0-5, or undefined to clear). */
export function rateCandidateRow(rowIndex: number, rating: NotebookRating | undefined): void {
    const state = store.getState();
    const activeBatch =
        state.notebook.batches.find((b) => b.id === state.activeBatchId) ??
        state.notebook.batches[0];
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

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/** Exports the full notebook to a JSON file. */
export function exportNotebookFile(): void {
    const notebook = store.getState().notebook;
    const text = serializeNotebook(notebook);
    const blob = new Blob([text], { type: 'application/json' });
    downloadBlob(blob, 'randomart-notebook.json');
}

/** Imports a notebook from a JSON file and renders its latest batch. */
export async function importNotebookFile(file: File): Promise<void> {
    const text = await file.text();
    try {
        const notebook = parseNotebook(catalog, text);
        store.setState({
            notebook,
            activeBatchId: notebook.batches[0]?.id ?? null,
            selectedRowIndex: 0,
            selectedCell: null,
            error: null,
        });
        void saveNotebookToDb(notebook);

        if (notebook.batches.length > 0) {
            const firstBatch = notebook.batches[0];
            if (firstBatch) {
                const rendered = renderBatchCandidates(
                    firstBatch,
                    Number(store.getState().settings.cellSize),
                );
                store.setState({ batches: rendered });
            }
        }
    } catch (cause) {
        store.setState({
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** Opens the selected cell (or selected row's first seed) in Lab mode as an artwork. */
export function keepCellAsArtwork(): void {
    const state = store.getState();
    const activeBatch =
        state.notebook.batches.find((b) => b.id === state.activeBatchId) ??
        state.notebook.batches[0];
    if (!activeBatch) {
        return;
    }

    const rowIndex = state.selectedCell?.rowIndex ?? state.selectedRowIndex;
    const colIndex = state.selectedCell?.colIndex ?? 0;

    const candidate = activeBatch.candidates[rowIndex];
    if (!candidate) {
        return;
    }

    const seed = candidate.seeds[colIndex] ?? candidate.seeds[0];
    if (seed === undefined) {
        return;
    }

    openCellInLab(candidate.grammar, seed);
}

/** Loads notebook from IndexedDB on startup. */
export async function initGalleryNotebook(): Promise<void> {
    try {
        const loaded = await loadNotebookFromDb(catalog);
        if (loaded && loaded.batches.length > 0) {
            const activeBatch = loaded.batches[0];
            if (!activeBatch) {
                return;
            }
            store.setState({
                notebook: loaded,
                activeBatchId: activeBatch.id,
            });
            const rendered = renderBatchCandidates(
                activeBatch,
                Number(store.getState().settings.cellSize),
            );
            store.setState({ batches: rendered });
        }
    } catch {
        // Fallback to empty notebook on storage error
    }
}
