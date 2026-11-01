import { defaultCatalog } from '../isa/default';
import { createGrammar } from './grammar';
import { grammarKey } from './quantized';
import type { Grammar } from './types';

export const grammarRegistry = {
    default: createGrammar(defaultCatalog, {
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

export type GrammarRegistryId = keyof typeof grammarRegistry;

export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
    const key = grammarKey(grammar);
    return (Object.keys(grammarRegistry) as GrammarRegistryId[]).find(
        (id) => grammarKey(grammarRegistry[id]) === key,
    );
}
