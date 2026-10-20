import type { Catalog } from '../core/catalog/index.ts';
import { parseNotebook, serializeNotebookData } from '../core/notebook/index.ts';
import type { Notebook } from '../core/notebook/index.ts';

const DB_NAME = 'randomart-db';
const DB_VERSION = 1;
const NOTEBOOK_STORE = 'notebook';
const CURRENT_NOTEBOOK_KEY = 'current_notebook';

function hasIndexedDb(): boolean {
    return typeof indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase | null> {
    if (!hasIndexedDb()) {
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(NOTEBOOK_STORE)) {
                db.createObjectStore(NOTEBOOK_STORE);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/** Persists the current notebook state to IndexedDB. */
export async function saveNotebookToDb(notebook: Notebook): Promise<void> {
    const db = await openDatabase();
    if (!db) {
        return;
    }

    const serialized = serializeNotebookData(notebook);

    return new Promise((resolve, reject) => {
        const tx = db.transaction(NOTEBOOK_STORE, 'readwrite');
        const store = tx.objectStore(NOTEBOOK_STORE);
        const req = store.put(serialized, CURRENT_NOTEBOOK_KEY);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

/** Loads the persisted notebook state from IndexedDB if present. */
export async function loadNotebookFromDb(catalog: Catalog): Promise<Notebook | null> {
    const db = await openDatabase();
    if (!db) {
        return null;
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction(NOTEBOOK_STORE, 'readonly');
        const store = tx.objectStore(NOTEBOOK_STORE);
        const req = store.get(CURRENT_NOTEBOOK_KEY);

        req.onsuccess = () => {
            if (!req.result) {
                resolve(null);
                return;
            }
            try {
                const text = JSON.stringify(req.result);
                const notebook = parseNotebook(catalog, text);
                resolve(notebook);
            } catch {
                resolve(null);
            }
        };
        req.onerror = () => reject(req.error);
    });
}
