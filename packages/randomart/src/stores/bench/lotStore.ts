import { create } from 'zustand';

import { buildLotView, EMPTY_LOT } from '../../bench/lot/lot';
import type { LotView } from '../../bench/lot/lot';
import { createBatch, createCandidate, rateNotebookCandidate } from '../../bench/notebook/notebook';
import type { NotebookBatch, NotebookRating } from '../../bench/notebook/types';
import { sampleGrammars } from '../../core/grammar/sample';
import type { Grammar } from '../../core/grammar/types';
import { randomSeed } from '../../core/random/seed';
import type { Seed } from '../../core/random/types';
import { createBatchRenderer } from '../../core/renderer/batch/batch';
import type { BatchRenderer, RenderedBatch } from '../../core/renderer/batch/batch';
import { getBenchSettings, setBenchBaseSeed } from './benchSettingsStore';
import {
    addBatch,
    getBenchActiveBatch,
    getBenchNotebook,
    importNotebookFile,
    initBenchNotebook,
    removeActiveBatchFromNotebook,
    setActiveBatchId,
    setBenchNotebook,
} from './notebookStore';

export type { BenchView } from './benchSettingsStore';

interface LotState {
    selectedRowIndex: number;
    selectedColIndex: number;
    lot: LotView;
    error: string | null;
}

const store = create<LotState>(() => ({
    selectedRowIndex: 0,
    selectedColIndex: 0,
    lot: EMPTY_LOT,
    error: null,
}));

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

/**
 * How the bench hands a `(grammar, seed)` pair to the app shell, which owns the Lab workspace and
 * the mode switch. Keeping it as a callback avoids a bench → lab dependency.
 */
type OpenInLabHandler = (grammar: Grammar, seed: Seed) => void;

let openInLabHandler: OpenInLabHandler | null = null;

export function setOpenInLabHandler(handler: OpenInLabHandler | null): void {
    openInLabHandler = handler;
}

let renderer: BatchRenderer | null = null;

function renderBatchCandidates(batch: NotebookBatch, cellSize: number): readonly RenderedBatch[] {
    renderer ??= createBatchRenderer();
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
        const { count, seedsPerGrammar, cellSize } = getBenchSettings();

        const sampled = sampleGrammars(count, { baseSeed, seedsPerGrammar });

        const candidates = sampled.map(({ grammar, seeds }) => createCandidate({ grammar, seeds }));
        const batch = createBatch({ candidates });

        const lot = buildLotView(renderBatchCandidates(batch, Number(cellSize)));

        addBatch(batch);

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
        });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function redrawBench(): void {
    const activeBatch = getBenchActiveBatch();

    if (!activeBatch) {
        drawBenchBatch();
        return;
    }

    try {
        const { cellSize } = getBenchSettings();
        const lot = buildLotView(renderBatchCandidates(activeBatch, Number(cellSize)));

        store.setState({ lot, error: null });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function selectBatch(batchId: string): void {
    const activeBatch = getBenchNotebook().batches.find((b) => b.id === batchId);

    if (!activeBatch) {
        return;
    }

    try {
        const { cellSize } = getBenchSettings();
        const lot = buildLotView(renderBatchCandidates(activeBatch, Number(cellSize)));

        setActiveBatchId(batchId);
        store.setState({
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
    const next = removeActiveBatchFromNotebook();

    if (next) {
        selectBatch(next.id);
    } else {
        store.setState({ lot: EMPTY_LOT, selectedRowIndex: 0, selectedColIndex: 0 });
    }
}

export function rateCandidateRow(rowIndex: number, rating: NotebookRating | undefined): void {
    const activeBatch = getBenchActiveBatch();

    if (!activeBatch) {
        return;
    }

    const candidate = activeBatch.candidates[rowIndex];

    if (!candidate) {
        return;
    }

    setBenchNotebook(rateNotebookCandidate(getBenchNotebook(), candidate.id, rating));
}

export function toggleCandidateRating(rowIndex: number, rating: NotebookRating): void {
    const activeBatch = getBenchActiveBatch();
    const candidate = activeBatch?.candidates[rowIndex];

    rateCandidateRow(rowIndex, candidate?.rating === rating ? undefined : rating);
}

export async function importNotebook(file: File): Promise<void> {
    try {
        const notebook = await importNotebookFile(file);
        const firstBatch = notebook.batches[0];

        if (firstBatch) {
            const lot = buildLotView(
                renderBatchCandidates(firstBatch, Number(getBenchSettings().cellSize)),
            );

            store.setState({
                selectedRowIndex: 0,
                selectedColIndex: 0,
                lot,
                error: null,
            });
        } else {
            store.setState({ lot: EMPTY_LOT });
        }
    } catch (cause) {
        store.setState({
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** Restores the persisted notebook and draws its active batch, if any. */
export async function initBench(): Promise<void> {
    await initBenchNotebook();

    const activeBatch = getBenchActiveBatch();

    if (!activeBatch) {
        return;
    }

    try {
        const lot = buildLotView(
            renderBatchCandidates(activeBatch, Number(getBenchSettings().cellSize)),
        );

        store.setState({
            selectedRowIndex: 0,
            selectedColIndex: 0,
            lot,
            error: null,
        });
    } catch (cause) {
        store.setState(buildErrorState(cause));
    }
}

export function openSelectedInLab(): void {
    const state = store.getState();
    const activeBatch = getBenchActiveBatch();

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

    openInLabHandler?.(candidate.grammar, seed);
}
