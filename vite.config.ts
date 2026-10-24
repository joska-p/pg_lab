import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { Features } from 'lightningcss';
import { defineConfig, lazyPlugins } from 'vite-plus';
import type { OxlintConfig, OxlintOverride } from 'vite-plus/lint';

// ═══════════════════════════════════════════════════════════════════════════
// 1. APP PRESET
//
// This section is imported by the `vite.config.ts` of every app/package.
// Vite resolves its config from the app directory, so each app still owns a
// small local config; it only delegates the shared stack to `defineAppConfig`.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vitest settings shared by the workspace root and by packages that run their own test command (for
 * example `randomart`'s `test:measure`).
 */
export const testConfig = {
    isolate: false,
    fsModuleCache: true,
};

/** Vite settings shared by every app. */
export const sharedViteConfig = {
    resolve: {
        conditions: ['source', 'module', 'browser', 'development|production'],
    },
    test: testConfig,
};

interface ReactPluginsOptions {
    /** Enable the StyleX unplugin. Disable for packages without StyleX. */
    stylex?: boolean;
}

/**
 * Shared Vite plugin stack for React apps.
 *
 * React Compiler runs through Oxc (`react({ compiler: true })`), not Babel.
 */
export function reactPlugins({ stylex: withStylex = true }: ReactPluginsOptions = {}) {
    return lazyPlugins(() => [
        ...(withStylex
            ? [
                  stylex({
                      dev: true,
                      useCSSLayers: true,
                      lightningcssOptions: {
                          exclude: Features.LightDark,
                      },
                  }),
              ]
            : []),
        react({ compiler: true }),
    ]);
}

interface AppConfigOptions {
    /** Public base path for the app. */
    base?: string;
    /** Enable the StyleX unplugin. Defaults to true. */
    stylex?: boolean;
}

/**
 * Build a Vite config for one app.
 *
 * Each app still owns a `vite.config.ts` because Vite resolves its config from the app directory;
 * this helper keeps the shared stack in one place.
 */
export function defineAppConfig({ stylex: withStylex = true, ...config }: AppConfigOptions = {}) {
    return defineConfig({
        ...sharedViteConfig,
        ...config,
        plugins: reactPlugins({ stylex: withStylex }),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. LINT PRESETS
//
// These are Oxlint settings, not Vite configuration. They are kept in this
// file so the whole workspace policy can be read top to bottom.
// ═══════════════════════════════════════════════════════════════════════════

const baseLint = {
    plugins: ['import'],
    rules: {
        // Repo / tooling
        // ─────────────────────────────────────────────

        'vite-plus/prefer-vite-plus-imports': 'error',

        // ─────────────────────────────────────────────
        // General correctness
        // ─────────────────────────────────────────────

        'oxc/branches-sharing-code': 'error',
        'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],

        // ─────────────────────────────────────────────
        // Modules / architecture
        // ─────────────────────────────────────────────

        // `import/no-relative-parent-imports` is intentionally not enabled: the
        // codebase uses `../` imports freely within a package. See
        // codex/docs/conventions for the import conventions.

        'import/no-cycle': 'error',
        'import/no-default-export': 'error',
        'import/no-duplicates': 'error',
        'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
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
    },
} satisfies Pick<OxlintConfig, 'plugins' | 'rules'>;

const reactLint = {
    plugins: ['react'],
    rules: {
        'react/rules-of-hooks': 'error',
        'react/only-export-components': [
            'warn',
            {
                allowConstantExport: true,
            },
        ],

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
} satisfies Omit<OxlintOverride, 'files'>;

const nodeLint = {
    env: {
        node: true,
    },
} satisfies Omit<OxlintOverride, 'files'>;

// ═══════════════════════════════════════════════════════════════════════════
// 3. WORKSPACE CONFIG
//
// The default export is the workspace-level config. It is used by `vp check`,
// `vp lint`, `vp fmt`, `vp run`, `vp staged`, `vp create`, `vp test` at the
// root, and by `defaultPackage`. It is not used by `vp dev`/`vp build` inside
// an app: those load the app's local `vite.config.ts`.
// ═══════════════════════════════════════════════════════════════════════════

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
    'packages/palette/**',
    'packages/pixel-manipulator/**',
    'packages/radu-machine-learning/**',
    'packages/randomart/**',
    'packages/sequencer/**',
    'packages/smith-tutle/**',
    'packages/ui/**',
];

export default defineConfig({
    defaultPackage: { dev: './apps/playground', build: './apps/playground' },
    test: testConfig,
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
                files: ['packages/randomart/src/dataset/node/**', 'packages/palette/core'],
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
