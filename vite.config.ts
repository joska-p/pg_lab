import { defineConfig } from 'vite-plus';

// Root config owns shared lint/fmt/staged/task defaults only.
// Vite transform plugins (StyleX, React, Babel) belong to each app's own
// vite.config.ts: dev/build/pack run per package, never on this root.
const ignorePatterns = ['dist/**', '**/vendor/*.js', '.agents/skills/impeccable/**'];

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

    staged: {
        '*.{js,ts,tsx}': 'vp check --fix',
    },

    test: {
        // `exclude` replaces Vitest's defaults, so restate them here plus
        // repo-specific noise: .direnv vendors nix flake sources containing
        // *.test.ts files that are not our suites.
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,eslint,prettier}.config.*',
            '.direnv/**',
        ],
    },

    // ─────────────────────────────────────────────
    // Formatting — Oxfmt owns code representation
    // ─────────────────────────────────────────────

    fmt: {
        ignorePatterns,

        tabWidth: 4,
        singleQuote: true,
        sortImports: true,
        jsdoc: true,
    },

    // ─────────────────────────────────────────────
    // Linting — Oxlint owns code invariants
    // ─────────────────────────────────────────────

    lint: {
        ignorePatterns,

        // React packages share one lint setup here instead of duplicating
        // the same `lint` block in each package's own vite.config.ts.
        // No `options` in overrides (not accepted there): typeAware/typeCheck
        // come from the root `lint.options` below (global).
        overrides: [
            {
                files: [
                    'apps/brouillon/**',
                    'apps/playground/**',
                    'packages/art-canvas/**',
                    'packages/automa/**',
                    'packages/fracture/**',
                    'packages/glaze/**',
                    'packages/glaze3d/**',
                    'packages/mol-demo/**',
                    'packages/mosaic-maker/**',
                ],
                plugins: ['react', 'typescript', 'oxc'],
                rules: {
                    'react/rules-of-hooks': 'error',
                    'react/only-export-components': [
                        'warn',
                        {
                            allowConstantExport: true,
                        },
                    ],
                    'vite-plus/prefer-vite-plus-imports': 'error',
                },
                jsPlugins: [
                    {
                        name: 'vite-plus',
                        specifier: 'vite-plus/oxlint-plugin',
                    },
                ],
            },
        ],

        jsPlugins: [
            {
                name: 'vite-plus',
                specifier: 'vite-plus/oxlint-plugin',
            },
        ],

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
            // Modules / architecture
            // ─────────────────────────────────────────────

            'import/no-cycle': 'error',
            'import/no-default-export': 'error',
            'import/no-duplicates': 'error',
            'import/no-relative-parent-imports': 'error',
            'import/no-unassigned-import': 'error',
            'import/export': 'error',

            // ─────────────────────────────────────────────
            // Style — syntax / idioms
            // ─────────────────────────────────────────────

            // Require explicit block scope.
            'eslint/curly': 'error',

            // Prefer concise object property syntax.
            'eslint/object-shorthand': 'error',

            // One binding declaration per statement.
            'eslint/one-var': ['error', 'never'],

            // Prefer lexical callbacks.
            'eslint/prefer-arrow-callback': 'error',

            // Prefer immutable bindings.
            'eslint/prefer-const': 'error',

            // Prefer modern numeric syntax.
            'eslint/prefer-exponentiation-operator': 'error',
            'eslint/prefer-numeric-literals': 'error',

            // Prefer modern object APIs / syntax.
            'eslint/prefer-object-has-own': 'error',
            'eslint/prefer-object-spread': 'error',

            // Prefer template literals for interpolation.
            'eslint/prefer-template': 'error',

            // Prefer modern, compact syntax.
            'unicorn/prefer-bigint-literals': 'error',
            'unicorn/prefer-spread': 'error',
            'unicorn/prefer-optional-catch-binding': 'error',

            // Keep expressions shallow.
            'unicorn/no-nested-ternary': 'error',

            // Explicit and scoped switch cases.
            'unicorn/switch-case-braces': 'error',

            // Explicit join semantics.
            'unicorn/require-array-join-separator': 'error',

            // Explicit Error construction.
            'unicorn/throw-new-error': 'error',

            // ─────────────────────────────────────────────
            // Style — platform idioms
            // ─────────────────────────────────────────────

            'unicorn/prefer-classlist-toggle': 'error',
            'unicorn/prefer-dom-node-dataset': 'error',
            'unicorn/prefer-dom-node-text-content': 'error',
            'unicorn/prefer-keyboard-event-key': 'error',
            'unicorn/prefer-negative-index': 'error',

            // ─────────────────────────────────────────────
            // Style — cleanup
            // ─────────────────────────────────────────────

            'unicorn/empty-brace-spaces': 'error',

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

            // Prefer function types for callable type declarations.
            'typescript/prefer-function-type': 'error',

            // Prefer the canonical const assertion syntax.
            'typescript/prefer-as-const': 'error',

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

        options: {
            typeAware: true,
            typeCheck: true,
        },
    },

    // ─────────────────────────────────────────────
    // Runtime
    // ─────────────────────────────────────────────

    run: {
        cache: true,
    },

    resolve: {
        // Bundler mirror of tsconfig.base.json customConditions: internal
        // runs resolve workspace packages through their "source" export
        // condition (raw .ts, required for the shared StyleX preset).
        // External consumers without it fall through to compiled dist.
        // Order = Vite client defaults with "source" first.
        conditions: ['source', 'module', 'browser', 'development|production'],
    },
});
