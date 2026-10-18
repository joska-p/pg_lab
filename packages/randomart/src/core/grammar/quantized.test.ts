import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { defaultGrammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';
import {
    FAMILY_IDS,
    FAMILY_OPERATORS,
    LEVEL_WEIGHT,
    recipeKey,
    recipeOf,
    recipeToGrammar,
    sampleRecipes,
} from './quantized.ts';
import type { Recipe } from './quantized.ts';

const catalog = createDefaultCatalog();
const ALLOWED = new Set(Object.values(LEVEL_WEIGHT));

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
});

describe('sampleRecipes', () => {
    it('is deterministic', () => {
        const a = sampleRecipes(catalog, 20, { baseSeed: 7 });
        const b = sampleRecipes(catalog, 20, { baseSeed: 7 });

        expect(a.map((s) => recipeKey(s.recipe))).toEqual(b.map((s) => recipeKey(s.recipe)));
        expect(a.map((s) => s.seeds)).toEqual(b.map((s) => s.seeds));
    });

    it('draws distinct recipes, with only quantized weights, anchors on', () => {
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

    it('always yields grammars the generator can use', () => {
        for (const { grammar, seeds } of sampleRecipes(catalog, 100)) {
            expect(() => generate(catalog, grammar, seeds[0] ?? createSeed(1))).not.toThrow();
        }
    });

    it('honours pinned axes', () => {
        for (const { recipe } of sampleRecipes(catalog, 30, {
            share: 2,
            space: 'oklab',
            motion: 'pulse',
        })) {
            expect(recipe.share).toBe(2);
            expect(recipe.space).toBe('oklab');
            expect(recipe.motion).toBe('pulse');
        }
    });

    it('seeds per grammar are distinct', () => {
        const [first] = sampleRecipes(catalog, 1, { seedsPerGrammar: 36 });

        expect(new Set(first?.seeds).size).toBe(36);
    });
});

describe('recipeToGrammar', () => {
    const levels = Object.fromEntries(FAMILY_IDS.map((f) => [f, 'normal'])) as Recipe['levels'];

    it('"mono" shares the trunk down to maxDepth', () => {
        const grammar = recipeToGrammar(catalog, {
            levels,
            size: 'medium',
            share: 'mono',
            space: 'oklch',
            motion: 'off',
        });

        expect(grammar.channels.shareDepth).toBe(grammar.constraints.maxDepth);
    });

    it('carries the motion axis into the grammar', () => {
        const grammar = recipeToGrammar(catalog, {
            levels,
            size: 'medium',
            share: 2,
            space: 'oklch',
            motion: 'swing',
        });

        expect(grammar.motion).toBe('swing');
    });
});

describe('recipeOf', () => {
    it('inverts recipeToGrammar on sampled recipes', () => {
        for (const { recipe, grammar } of sampleRecipes(catalog, 100)) {
            expect(recipeOf(grammar)).toEqual(recipe);
        }
    });

    it('refuses a grammar outside the space', () => {
        expect(recipeOf(defaultGrammar(catalog))).toBeNull();
    });
});
