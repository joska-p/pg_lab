import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createSeed } from '../random/index.ts';
import { DEFAULT_RECIPE, defaultGrammar } from './presets.ts';
import {
    ANCHOR_OPERATORS,
    FAMILY_IDS,
    FAMILY_OPERATORS,
    LEVEL_WEIGHT,
    levelOf,
    recipeKey,
    recipeOf,
    recipeToGrammar,
    repairRecipe,
    sampleRecipes,
} from './quantized.ts';
import type { Recipe } from './types.ts';

const catalog = createDefaultCatalog();
const ALLOWED = new Set(Object.values(LEVEL_WEIGHT));

/** Helper: a copy of a grammar with a patched weight, bypassing the grid. */
function createGrammarLike(
    grammar: ReturnType<typeof defaultGrammar>,
    patch: Record<string, number>,
): ReturnType<typeof defaultGrammar> {
    return {
        ...grammar,
        weights: { ...grammar.weights, ...patch },
    } as ReturnType<typeof defaultGrammar>;
}

describe('families', () => {
    it('cover every catalog operator exactly once', () => {
        const covered = Object.values(FAMILY_OPERATORS).flat().sort();

        expect(covered).toEqual(
            catalog
                .operators()
                .map((operator) => operator.name)
                .sort(),
        );
    });

    it('anchors are the catalog terminals', () => {
        for (const name of ANCHOR_OPERATORS) {
            expect(catalog.operator(name).isTerminal).toBe(true);
        }
    });
});

describe('the default recipe', () => {
    it('sits exactly on the grid: defaultGrammar is a point of the space', () => {
        expect(recipeOf(defaultGrammar(catalog))).toEqual(repairRecipe(catalog, DEFAULT_RECIPE));
    });

    it('keeps x and y as the only structure anchors', () => {
        expect(DEFAULT_RECIPE.levels.x).toBe('4');
        expect(DEFAULT_RECIPE.levels.y).toBe('4');
    });
});

describe('repairRecipe', () => {
    it('fills absent operators with the neutral level', () => {
        const repaired = repairRecipe(catalog, {
            levels: { x: '4' },
            size: 'medium',
            share: 2,
            space: 'oklch',
        });

        for (const name of Object.values(FAMILY_OPERATORS).flat()) {
            expect(repaired.levels[name]).toBeDefined();
        }

        expect(levelOf(repaired, 'warp')).toBe('1');
    });

    it('raises the first anchor when both would be off', () => {
        const repaired = repairRecipe(catalog, {
            levels: { x: '0', y: '0' },
            size: 'medium',
            share: 2,
            space: 'oklch',
        });

        expect(repaired.levels.x).toBe('1');
    });

    it('rejects an unknown size profile by falling back to medium', () => {
        const repaired = repairRecipe(catalog, {
            levels: { x: '1' },
            size: 'nope' as never,
            share: 2,
            space: 'oklch',
        });

        expect(repaired.size).toBe('medium');
    });
});

describe('sampleRecipes', () => {
    it('is deterministic', () => {
        const a = sampleRecipes(catalog, 20, { baseSeed: 7 });
        const b = sampleRecipes(catalog, 20, { baseSeed: 7 });

        expect(a.map((s) => recipeKey(s.recipe))).toEqual(b.map((s) => recipeKey(s.recipe)));
        expect(a.map((s) => s.seeds)).toEqual(b.map((s) => s.seeds));
    });

    it('draws distinct recipes, with only grid weights and live anchors', () => {
        const sampled = sampleRecipes(catalog, 60);

        expect(new Set(sampled.map((s) => recipeKey(s.recipe))).size).toBe(60);

        for (const { grammar } of sampled) {
            for (const weight of Object.values(grammar.weights)) {
                expect(ALLOWED.has(weight ?? 0)).toBe(true);
            }

            expect(grammar.weights.x).toBeGreaterThan(0);
            expect(grammar.weights.y).toBeGreaterThan(0);
        }
    });

    it('keeps at least `minActiveOperators` non-anchor operators on', () => {
        for (const { recipe } of sampleRecipes(catalog, 100)) {
            const active = Object.entries(recipe.levels).filter(
                ([name, level]) => level !== '0' && !ANCHOR_OPERATORS.includes(name as never),
            ).length;

            expect(active).toBeGreaterThanOrEqual(2);
        }
    });

    it('always yields grammars the generator can use', () => {
        for (const { grammar, seeds } of sampleRecipes(catalog, 100)) {
            expect(() => generate(catalog, grammar, seeds[0] ?? createSeed(1))).not.toThrow();
        }
    });

    it('honours pinned axes', () => {
        for (const { recipe } of sampleRecipes(catalog, 30, {
            share: 2,
            space: 'oklab',
        })) {
            expect(recipe.share).toBe(2);
            expect(recipe.space).toBe('oklab');
        }
    });

    it('seeds per grammar are distinct', () => {
        const [first] = sampleRecipes(catalog, 1, { seedsPerGrammar: 36 });

        expect(new Set(first?.seeds).size).toBe(36);
    });
});

describe('recipeToGrammar', () => {
    const levels = Object.fromEntries(
        FAMILY_IDS.flatMap((family) => FAMILY_OPERATORS[family].map((name) => [name, '1'])),
    ) as Recipe['levels'];

    it('"mono" shares the trunk down to maxDepth', () => {
        const grammar = recipeToGrammar(catalog, {
            levels,
            size: 'medium',
            share: 'mono',
            space: 'oklch',
        });

        expect(grammar.channels.shareDepth).toBe(grammar.constraints.maxDepth);
    });

    it('shares no trunk at share 0', () => {
        const grammar = recipeToGrammar(catalog, {
            levels,
            size: 'medium',
            share: 0,
            space: 'oklch',
        });

        expect(grammar.channels.shareDepth).toBe(0);
    });
});

describe('recipeOf', () => {
    it('inverts recipeToGrammar on sampled recipes', () => {
        for (const { recipe, grammar } of sampleRecipes(catalog, 100)) {
            expect(recipeOf(grammar)).toEqual(recipe);
        }
    });

    it('reads the default grammar back to the default recipe', () => {
        expect(recipeOf(defaultGrammar(catalog))?.levels.x).toBe('4');
    });

    it('refuses a grammar whose weights are off the grid', () => {
        const grammar = createGrammarLike(defaultGrammar(catalog), { x: 2.5 });

        expect(recipeOf(grammar)).toBeNull();
    });
});
