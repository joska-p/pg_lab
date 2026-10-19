import type { OxlintOverride } from 'vite-plus/lint';

/**
 * Coherence rules for randomart (conventions §1.2, §2.1, §2.4).
 *
 * These were the gates of the standalone coherence audit; composed as `files` overrides in the root
 * `vite.config.ts` so `vp check` enforces them:
 *
 * - Explicit extension on every relative import;
 * - Layer direction: `core/` never reaches into a higher layer;
 * - Core purity: no ambient randomness, time or DOM in `core/`.
 *
 * `import/extensions` stays scoped to randomart: the rest of the workspace has not been migrated to
 * explicit extensions yet.
 */
export const randomartLint: OxlintOverride[] = [
    {
        files: ['packages/randomart/**'],
        rules: {
            'import/extensions': ['error', 'ignorePackages', { ts: 'always', tsx: 'always' }],
        },
    },
    {
        files: ['packages/randomart/src/core/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '**/renderer/**',
                                '**/stores/**',
                                '**/components/**',
                                '**/storage/**',
                                '**/dataset/**',
                            ],
                            message: 'core/ must not reach into higher layers (conventions §2.4)',
                        },
                    ],
                },
            ],
            'no-restricted-globals': [
                'error',
                'document',
                'window',
                'localStorage',
                'indexedDB',
                'requestAnimationFrame',
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Math',
                    property: 'random',
                    message: 'core must not reach for ambient randomness (conventions §1.2)',
                },
                {
                    object: 'Date',
                    property: 'now',
                    message: 'core must not reach for ambient time (conventions §1.2)',
                },
                {
                    object: 'performance',
                    property: 'now',
                    message: 'core must not reach for ambient time (conventions §1.2)',
                },
            ],
        },
    },
    {
        files: ['packages/randomart/src/core/**/*.test.ts'],
        rules: {
            'no-restricted-globals': 'off',
            'no-restricted-properties': 'off',
        },
    },
    {
        files: [
            'packages/randomart/src/core/random/seed.ts',
            'packages/randomart/src/core/notebook/notebook.ts',
        ],
        rules: {
            'no-restricted-properties': 'off',
        },
    },
];
