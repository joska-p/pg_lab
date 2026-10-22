import { createGrammar } from './grammar';
import type { Grammar } from './types';

/** Registry of grammar presets, keyed by preset id. Validated by `createGrammar` at module load. */
export const grammarRegistry = {
    default: createGrammar({
        label: 'Default',
        description: 'default grammar',
        weights: {
            abs: 1,
            add: 1,
            const: 1,
            cos: 1,
            div: 1,
            gt: 1,
            max: 2,
            min: 2,
            mix: 1,
            mul: 1,
            neg: 1,
            select: 1,
            sin: 1,
            sqr: 1,
            warp: 1,
            x: 4,
            y: 4,
        },
        size: 'medium',
        shareDepth: 2,
        space: 'oklch',
    }),
} as const satisfies Record<string, Grammar>;

/** Opaque key into the grammar registry. Inferred from the registry keys. */
export type GrammarRegistryId = keyof typeof grammarRegistry;

/** Type of the grammar registry (for internal use). */
export type GrammarRegistry = typeof grammarRegistry;
