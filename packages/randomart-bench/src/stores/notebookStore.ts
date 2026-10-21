import type { Catalog } from '@repo/randomart-core/catalog/Catalog';
import {
    addBatchToNotebook,
    createNotebook,
    removeBatchFromNotebook,
} from '@repo/randomart-core/notebook/notebook';
import { parseNotebook, serializeNotebook } from '@repo/randomart-core/notebook/serialize';
import type { Notebook, NotebookBatch } from '@repo/randomart-core/notebook/types';
import { create } from 'zustand';

import { loadNotebookFromDb, saveNotebookToDb } from '../storage/notebookDb';

interface NotebookState {
    notebook: Notebook;
    activeBatchId: string | null;
}

const store = create<NotebookState>(() => ({
    notebook: createNotebook(),
    activeBatchId: null,
}));

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

export function getBenchNotebook(): Notebook {
    return store.getState().notebook;
}

export function getBenchActiveBatch(): NotebookBatch | undefined {
    const { notebook, activeBatchId } = store.getState();

    return notebook.batches.find((batch) => batch.id === activeBatchId) ?? notebook.batches[0];
}

export function setBenchNotebook(notebook: Notebook): void {
    store.setState({ notebook });
    void saveNotebookToDb(notebook);
}

export function setActiveBatchId(batchId: string | null): void {
    store.setState({ activeBatchId: batchId });
}

export function addBatch(batch: NotebookBatch): void {
    const nextNotebook = addBatchToNotebook(store.getState().notebook, batch);

    store.setState({ notebook: nextNotebook, activeBatchId: batch.id });
    void saveNotebookToDb(nextNotebook);
}

/** Removes the active batch and returns the batch that becomes active, if any. */
export function removeActiveBatchFromNotebook(): NotebookBatch | undefined {
    const state = store.getState();
    const activeBatch = state.notebook.batches.find((b) => b.id === state.activeBatchId);

    if (!activeBatch) {
        return undefined;
    }

    const nextNotebook = removeBatchFromNotebook(state.notebook, activeBatch.id);
    const next = nextNotebook.batches[0] ?? undefined;

    store.setState({ notebook: nextNotebook, activeBatchId: next?.id ?? null });
    void saveNotebookToDb(nextNotebook);

    return next;
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

export async function importNotebookFile(file: File, catalog: Catalog): Promise<Notebook> {
    const text = await file.text();
    const notebook = parseNotebook(catalog, text);

    store.setState({
        notebook,
        activeBatchId: notebook.batches[0]?.id ?? null,
    });
    void saveNotebookToDb(notebook);

    return notebook;
}

export async function initBenchNotebook(catalog: Catalog): Promise<void> {
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
        }
    } catch {
        // Fallback to empty notebook on storage error
    }
}
