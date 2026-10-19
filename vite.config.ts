import { defineConfig } from 'vite-plus';

import { baseLint } from './tools/lint/base.ts';
import { nodeLint } from './tools/lint/node.ts';
import { reactLint } from './tools/lint/react.ts';

const ignorePatterns = ['dist/**', '**/vendor/*.js', '.agents/**/*.{js,ts}'];

// Packages that depend on React (see each package.json).
const reactPackages = [
    'apps/**',
    'packages/art-canvas/**',
    'packages/automa/**',
    'packages/fracture/**',
    'packages/glaze/**',
    'packages/mol-demo/**',
    'packages/mosaic-maker/**',
    'packages/randomart/**',
    'packages/ui/**',
];

export default defineConfig({
    defaultPackage: { dev: './apps/playground', build: './apps/playground' },
    test: { isolate: false, fsModuleCache: true },
    create: {
        templates: [
            {
                name: 'new-mini-app',
                description: 'Scaffold a new mini-app from the specimen template.',
                template: './tools/new-mini-app',
            },
        ],
    },
    staged: {
        '*.{js,jsx,ts,tsx}': 'vp check --fix',
    },
    fmt: {
        tabWidth: 4,
        singleQuote: true,
        sortImports: true,
        jsdoc: true,
    },
    lint: {
        ...baseLint,
        ignorePatterns,
        jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        options: { typeAware: true, typeCheck: true },
        overrides: [
            {
                files: reactPackages,
                ...reactLint,
            },
            {
                files: ['tools/**'],
                ...nodeLint,
            },
            {
                // Config files and CLI templates require default exports.
                files: ['**/vite.config.ts', 'tools/new-mini-app/src/template.ts'],
                rules: {
                    'import/no-default-export': 'off',
                },
            },
        ],
    },
    run: {
        cache: true,
        tasks: {
            // Mechanical coherence audit for randomart (dead code, layers, purity, vocabulary,
            // duplication). Reporting is complete even when a check fails; see tools/audit/run.mjs.
            audit: {
                command: 'node tools/audit/run.mjs',
                cache: false,
            },
        },
    },
});
