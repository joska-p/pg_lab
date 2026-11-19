import solid from '@solidjs/vite-plugin';
import { fileRoutes } from 'filesystem-routing/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
    // GitHub Pages serves the site under /pg_lab/; assets follow the Vite base
    // while the router keeps application paths in the URL hash.
    base: '/pg_lab/',
    // Turnkey client mode: no index.html and no mount file — the plugin generates
    // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
    // prerenders the shell into a purely static dist/client.
    plugins: lazyPlugins(() => [
        // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
        // modules the fileRoutes plugin emits (their ids end in a query string).
        solid({ start: true, extensions: ['.jsx', '.tsx'], diagnostics: true }), // add `ssr: true` for streaming SSR
        fileRoutes({ types: true }),
    ]),
    server: {
        port: 3000,
    },
    build: {
        target: 'esnext',
        assetsInlineLimit: 0,
    },
    test: {
        name: 'solid',
        // The Solid plugin injects jest-dom setup automatically; Vitest's
        // default environment is `node`, but component tests need a DOM.
        environment: 'jsdom',
    },
});
