import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

import { testConfig } from './app.ts';
import { baseLint, ignorePatterns, nodeLint, reactLint } from './lint.ts';

const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

interface WorkspacePackage {
    path: string;
    react: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasReact(value: unknown): boolean {
    return isRecord(value) && 'react' in value;
}

/** Read every workspace manifest: React may be a direct, dev, or peer dependency. */
function findWorkspacePackages(): WorkspacePackage[] {
    const result: WorkspacePackage[] = [];

    for (const group of ['apps', 'packages', 'tools']) {
        for (const entry of readdirSync(join(workspaceRoot, group), { withFileTypes: true })) {
            if (!entry.isDirectory()) {
                continue;
            }

            const manifestPath = join(workspaceRoot, group, entry.name, 'package.json');
            const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
            if (!isRecord(manifest)) {
                continue;
            }

            result.push({
                path: `${group}/${entry.name}`,
                react:
                    hasReact(manifest.dependencies) ||
                    hasReact(manifest.devDependencies) ||
                    hasReact(manifest.peerDependencies),
            });
        }
    }

    return result;
}

const workspacePackages = findWorkspacePackages();
const reactPackages = workspacePackages.filter((pkg) => pkg.react).map((pkg) => `${pkg.path}/**`);
const nodePackages = [
    ...workspacePackages.filter((pkg) => !pkg.react).map((pkg) => `${pkg.path}/**`),
    // Path-based exception: the pure TypeScript core of a React package.
    'packages/palette/src/core/**',
];

// The workspace config is consumed through Vite's default export.
// oxlint-disable-next-line import/no-default-export
export default defineConfig({
    defaultPackage: './apps/playground',
    server: {
        host: true,
    },
    test: {
        ...testConfig,
    },
    create: {
        templates: [
            {
                name: 'new-experiment',
                description: 'Scaffold a new Experiment folder in the Workbench.',
                template: './tools/new-experiment',
            },
        ],
    },
    staged: {
        '*.{js,jsx,ts,tsx}': 'vp check --fix',
    },
    fmt: {
        ignorePatterns: ['dist/**', '.agents/skills'],
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
                // The randomart core is pure TypeScript: no browser environment, no storage.
                files: ['packages/randomart-core/**'],
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
                files: nodePackages,
                ...nodeLint,
            },

            {
                // Config files and CLI templates require default exports.
                files: ['**/vite.config.ts', 'tools/new-experiment/src/template.ts'],
                rules: {
                    'import/no-default-export': 'off',
                },
            },

            {
                // Tests need assertion.
                files: ['**/*.test.ts'],
                rules: {
                    'typescript/no-unsafe-type-assertion': 'off',
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
