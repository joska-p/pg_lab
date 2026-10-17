import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../core/catalog/index.ts';
import { createNotebook } from '../core/notebook/index.ts';
import { getCachedVignette, loadNotebookFromDb, saveNotebookToDb } from './notebookDb.ts';

describe('notebookDb', () => {
    const catalog = createDefaultCatalog();

    it('gracefully handles environments without indexedDB', async () => {
        const notebook = createNotebook();
        await expect(saveNotebookToDb(notebook)).resolves.toBeUndefined();
        const loaded = await loadNotebookFromDb(catalog);
        expect(loaded).toBeNull();
        const vignette = await getCachedVignette('non-existent');
        expect(vignette).toBeNull();
    });
});
