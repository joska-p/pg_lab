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
                // the core must not reach for its environment. `core` is pure TypeScript
                // except `renderer/batchRenderer.ts`, the one browser edge of the domain.
                files: ['packages/randomart/src/core/**'],
                rules: {
                    'no-restricted-globals': [
                        'error',
                        'document',
                        'window',
                        'navigator',
                        'requestAnimationFrame',
                        'localStorage',
                        'sessionStorage',
                        'indexedDB',
                    ],
                },
            },
            {
                // The single allowed DOM boundary: it creates the offscreen canvas the batch
                // renderer draws into.
                files: ['packages/randomart/src/core/renderer/batchRenderer.ts'],
                rules: {
                    'no-restricted-globals': 'off',
                },
            },
            {
                files: ['tools/**'],
                ...nodeLint,
            },
            {
                files: ['packages/randomart/src/dataset/node/**'],
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
            knip: {
                command:
                    'knip --reporter json > ./reports/knip.json; knip --reporter markdown > ./reports/knip.md',
                cache: false,
            },
            jscpd: {
                command: 'jscpd --config .jscpd.json',
                cache: false,
            },
            madge: {
                command:
                    'madge --circular --extensions ts,tsx --exclude "(test|__snapshots__|node_modules|dist|build|vendor)" apps packages tools',
                cache: false,
            },
            madgeViewDeps: {
                command:
                    'madge --extensions ts,tsx --exclude "(test|__snapshots__|node_modules|dist|build|vendor)" --image reports/dependencies.svg apps packages tools',
                cache: false,
            },
            madgeViewCircular: {
                command:
                    'madge --circular --extensions ts,tsx --exclude "(test|__snapshots__|node_modules|dist|build|vendor)" --image reports/circular.svg apps packages tools',
                cache: false,
            },
            audit: {
                command:
                    'vp run knip; vp run madgeViewCircular; vp run madgeViewDeps; vp run jscpd',
                cache: false,
            },
        },
    },
});
