/**
 * Shared Vite settings applied to every workspace package.
 *
 * Root `vite.config.ts` is reserved for lint, fmt, staged and task definitions. Vite/Vitest options
 * live next to the packages that consume them, imported from here so they stay centralized.
 */
export const sharedViteConfig = {
    resolve: {
        conditions: ['source', 'module', 'browser', 'development|production'],
    },
    test: {
        isolate: false,
    },
};
