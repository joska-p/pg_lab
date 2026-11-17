import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig } from 'vite-plus';

const APP_ROOT = import.meta.dirname;
const EXPERIMENTS_ROOT = join(APP_ROOT, 'experiments');

function collectExperimentPages(directory: string): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (!entry.isDirectory()) {
            return [];
        }

        const path = join(directory, entry.name);
        const page = join(path, 'index.html');
        const pages = existsSync(page) ? [page] : [];

        return [...pages, ...collectExperimentPages(path)];
    });
}

export default defineConfig({
    // Relative base keeps the built site usable from any local subpath.
    base: './',
    build: {
        rollupOptions: {
            input: [join(APP_ROOT, 'index.html'), ...collectExperimentPages(EXPERIMENTS_ROOT)],
        },
    },
});
