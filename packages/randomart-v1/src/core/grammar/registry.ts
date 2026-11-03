import { createGrammar } from './grammar';
import { grammarKey } from './quantized';
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

/**
 * Registry id of the preset whose content matches `grammar`, or undefined when the point is custom.
 * Matching is content-based (weights, size, shareDepth, space): a grammar's `id` is a hash of its
 * weights only, so it cannot tell apart two points that differ on another axis.
 */
export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
    const key = grammarKey(grammar);

    return (Object.keys(grammarRegistry) as GrammarRegistryId[]).find(
        (id) => grammarKey(grammarRegistry[id]) === key,
    );
}
