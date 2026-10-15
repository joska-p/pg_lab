import type { OxlintOverride } from 'vite-plus/lint';

/**
 * React / React Compiler rules.
 *
 * Applied only to packages that depend on React, via a `files` override in the root
 * `vite.config.ts`.
 */
export const reactLint = {
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
