import type { OxlintOverride } from 'vite-plus/lint';

/**
 * Coherence rules for randomart (conventions §1.2, §2.1, §2.4).
 *
 * These were the gates of the standalone coherence audit; composed as `files` overrides in the root
 * `vite.config.ts` so `vp check` enforces them:
 *
 * - Layer direction: `core` < `renderer` / `storage` < `stores` < `components`, each layer only
 *   imports downwards;
 * - Core purity: no ambient randomness, time, network or DOM in `core/`.
 */

/** Layers a lower layer must never import, as import-path globs. */
const LAYER_GLOBS = {
    renderer: '**/renderer/**',
    stores: '**/stores/**',
    components: '**/components/**',
    storage: '**/storage/**',
    dataset: '**/dataset/**',
} as const;

type Layer = keyof typeof LAYER_GLOBS;

/** One `files` override forbidding `forbidden` layers from the files of `layer`. */
function forbidLayers(layer: string, forbidden: readonly Layer[]): OxlintOverride {
    return {
        files: [`packages/randomart/src/${layer}/**`],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: forbidden.map((name) => LAYER_GLOBS[name]),
                            message: `${layer}/ must not reach into higher layers (conventions §2.4)`,
                        },
                    ],
                },
            ],
        },
    };
}

export const randomartLint: OxlintOverride[] = [
    forbidLayers('core', ['renderer', 'stores', 'components', 'storage', 'dataset']),
    forbidLayers('renderer', ['stores', 'components', 'storage', 'dataset']),
    forbidLayers('storage', ['renderer', 'stores', 'components', 'dataset']),
    forbidLayers('stores', ['components', 'dataset']),
    {
        // Known violation (codex/notes/findings.md, "LotView layer inversion"): the store imports
        // the lot builder from `components/bench/`. Remove this override when `lot.ts` moves.
        files: ['packages/randomart/src/stores/benchStore.ts'],
        rules: {
            'no-restricted-imports': 'off',
        },
    },
    {
        files: ['packages/randomart/src/core/**'],
        rules: {
            // `Date` and `performance` are time, `crypto` is randomness, the rest is I/O or DOM:
            // the shell reads them and hands the values in (conventions §1.2).
            'no-restricted-globals': [
                'error',
                'document',
                'window',
                'navigator',
                'localStorage',
                'indexedDB',
                'requestAnimationFrame',
                'setTimeout',
                'setInterval',
                'fetch',
                'Date',
                'performance',
                'crypto',
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Math',
                    property: 'random',
                    message: 'core must not reach for ambient randomness (conventions §1.2)',
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
        // The two documented non-deterministic sources of core: `randomSeed` (crypto) and the
        // notebook ids and timestamps (`Date`, `Math.random`).
        files: [
            'packages/randomart/src/core/random/seed.ts',
            'packages/randomart/src/core/notebook/notebook.ts',
        ],
        rules: {
            'no-restricted-globals': 'off',
            'no-restricted-properties': 'off',
        },
    },
];
