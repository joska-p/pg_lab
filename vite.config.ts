import stylexPlugin from 'unplugin-stylex/vite';
import { defineConfig } from 'vite-plus';

const ignorePatterns = ['dist/**', '**/vendor/*.js', '.agents/skills/impeccable'];

export default defineConfig({
    create: {
        templates: [
            {
                name: 'new-mini-app',
                description: 'Scaffold a new mini-app from the specimen template.',
                template: './tools/new-mini-app',
            },
        ],
    },
    plugins: [stylexPlugin()],
    staged: {
        '*': 'vp check --fix',
    },
    fmt: {
        ignorePatterns,
        tabWidth: 4,
        singleQuote: true,
        sortImports: true,
        jsdoc: true,
    },
    lint: {
        ignorePatterns,
        jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        rules: {
            // ─────────────────────────────────────────────
            // Repo / tooling
            // ─────────────────────────────────────────────

            'vite-plus/prefer-vite-plus-imports': 'error',

            // ─────────────────────────────────────────────
            // General correctness
            // ─────────────────────────────────────────────

            'oxc/branches-sharing-code': 'error',

            // ─────────────────────────────────────────────
            // Modules
            // ─────────────────────────────────────────────

            'import/no-cycle': 'error',
            'import/no-default-export': 'error',
            'import/no-duplicates': 'error',
            'import/no-relative-parent-imports': 'error',
            'import/no-unassigned-import': 'error',
            'import/export': 'error',

            // ─────────────────────────────────────────────
            // TypeScript — consistency
            // ─────────────────────────────────────────────

            'typescript/adjacent-overload-signatures': 'error',

            'typescript/consistent-type-assertions': [
                'warn',
                {
                    assertionStyle: 'as',
                },
            ],

            'typescript/consistent-type-definitions': 'error',

            'typescript/consistent-type-exports': 'error',

            'typescript/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],

            'typescript/consistent-indexed-object-style': ['error', 'record'],

            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

            // ─────────────────────────────────────────────
            // TypeScript — safety / unnecessary complexity
            // ─────────────────────────────────────────────

            'oxc/no-const-enum': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-require-imports': 'error',
            'typescript/no-import-type-side-effects': 'error',

            'typescript/no-inferrable-types': 'error',

            'typescript/no-unnecessary-template-expression': 'error',
            'typescript/no-unnecessary-type-arguments': 'error',
            'typescript/no-unnecessary-type-assertion': 'error',
            'typescript/no-non-null-asserted-nullish-coalescing': 'error',

            // ─────────────────────────────────────────────
            // TypeScript — explicitness
            // ─────────────────────────────────────────────

            'typescript/dot-notation': 'error',
            'typescript/switch-exhaustiveness-check': 'error',

            // ─────────────────────────────────────────────
            // React / React Compiler
            // ─────────────────────────────────────────────

            'react/syntax': 'error',
            'react/globals': 'error',
            'react/immutability': 'error',
            'react/purity': 'error',
            'react/refs': 'error',

            'react/set-state-in-render': 'error',
            'react/set-state-in-effect': 'error',

            'react/static-components': 'error',
            'react/use-memo': 'error',

            'react/incompatible-library': 'warn',
            'react/preserve-manual-memoization': 'error',
        },
        options: { typeAware: true, typeCheck: true },
    },
    run: {
        cache: true,
    },
});
