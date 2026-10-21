import { describe, expect, it } from 'vite-plus/test';

import { createNotebook } from '../notebook/notebook';
import { loadNotebookFromDb, saveNotebookToDb } from './notebookDb';

describe('notebookDb', () => {
    it('gracefully handles environments without indexedDB', async () => {
        const notebook = createNotebook();
        await expect(saveNotebookToDb(notebook)).resolves.toBeUndefined();
        const loaded = await loadNotebookFromDb();
        expect(loaded).toBeNull();
    });
});
