import { createDefaultCatalog } from '@repo/randomart-core/catalog/Catalog';
import { describe, expect, it } from 'vite-plus/test';

import { createNotebook } from '../notebook/notebook';
import { loadNotebookFromDb, saveNotebookToDb } from './notebookDb';

describe('notebookDb', () => {
    const catalog = createDefaultCatalog();

    it('gracefully handles environments without indexedDB', async () => {
        const notebook = createNotebook();
        await expect(saveNotebookToDb(notebook)).resolves.toBeUndefined();
        const loaded = await loadNotebookFromDb(catalog);
        expect(loaded).toBeNull();
    });
});
