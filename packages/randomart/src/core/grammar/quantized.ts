import type { Catalog, OperatorId } from '../catalog/index.ts';
import { COLOR_SPACE_IDS } from '../color/index.ts';
import type { ColorSpaceId } from '../color/index.ts';
import { CONFIG } from '../config/index.ts';
import type { SizeProfileId, WeightLevel } from '../config/index.ts';
import { createRng } from '../random/index.ts';
import type { Rng, Seed } from '../random/index.ts';
import { createGrammar, weightOf } from './grammar.ts';
import { deriveSeed } from './sample.ts';
import type { ConstraintsInput, FamilyId, Grammar, Recipe, ShareChoice } from './types.ts';

/**
 * The quantized search space: a handful of categorical knobs instead of 22 continuous weights. A
 * `Recipe` is the coordinate of a grammar in that space; `recipeToGrammar` is the only way down to
 * a real `Grammar`. Neighbourhood ("one notch away") is meaningful here, which it is not on
 * continuous weights.
 */

export const FAMILY_IDS = [
    'anchors',
    'extrema',
    'arithmetic',
    'trigonometry',
    'logic',
    'warp',
] as const;

/** Every catalog operator belongs to exactly one family (asserted by a test). */
export const FAMILY_OPERATORS: Record<FamilyId, readonly OperatorId[]> = {
    anchors: ['x', 'y'],
    extrema: ['min', 'max'],
    arithmetic: ['const', 'neg', 'abs', 'sqr', 'add', 'mul', 'div', 'mix'],
    trigonometry: ['sin', 'cos'],
    logic: ['gt', 'select'],
    warp: ['warp'],
};

export type { SizeProfileId, WeightLevel } from '../config/index.ts';

/**
 * Axis ids in draw order: they come from the config entry order, which `randomRecipe` consumes
 * through the PRNG — append new entries in `CONFIG.recipe`, never reorder.
 */
export const WEIGHT_LEVELS = Object.keys(CONFIG.recipe.levels) as readonly WeightLevel[];
export const SIZE_PROFILE_IDS = Object.keys(CONFIG.recipe.sizeProfiles) as readonly SizeProfileId[];

function levelsField(field: 'weight' | 'odds'): Record<WeightLevel, number> {
    const values = {} as Record<WeightLevel, number>;

    for (const level of WEIGHT_LEVELS) {
        values[level] = CONFIG.recipe.levels[level][field];
    }

    return values;
}

/** Operator weight each level maps to (its meaning on the axis). */
export const LEVEL_WEIGHT = levelsField('weight');

/** Relative odds of each level in a random draw — bias the sampler in `CONFIG.recipe.levels`. */
const LEVEL_ODDS = levelsField('odds');

/**
 * Levels anchors (x/y) may be drawn at — the `allowsAnchors` flags of `CONFIG.recipe.levels`:
 * anchors can never be `off`, without x/y the image has no spatial variation.
 */
export const ANCHOR_LEVELS: readonly WeightLevel[] = WEIGHT_LEVELS.filter(
    (level) => CONFIG.recipe.levels[level].allowsAnchors,
);

/** Depth/node budgets per size — the values live in `CONFIG.recipe.sizeProfiles`. */
export const SIZE_PROFILES: Record<SizeProfileId, ConstraintsInput> = CONFIG.recipe.sizeProfiles;

export const SHARE_CHOICES = [0, 1, 2, 3, 'mono'] as const;
/** Stable identity, for deduplication and caches. */
export function recipeKey(recipe: Recipe): string {
    return JSON.stringify([
        ...FAMILY_IDS.map((family) => recipe.levels[family]),
        recipe.size,
        recipe.share,
        recipe.space,
    ]);
}

export function recipeToGrammar(catalog: Catalog, recipe: Recipe): Grammar {
    const weights: Record<string, number> = {};

    for (const family of FAMILY_IDS) {
        for (const name of FAMILY_OPERATORS[family]) {
            weights[name] = LEVEL_WEIGHT[recipe.levels[family]];
        }
    }

    const constraints = SIZE_PROFILES[recipe.size];
    const shareDepth = recipe.share === 'mono' ? constraints.maxDepth : recipe.share;

    return createGrammar(catalog, {
        weights,
        constraints,
        channels: { space: recipe.space, shareDepth },
    });
}

export interface RandomRecipeOptions {
    /** Pin an axis instead of drawing it (e.g. a controlled `shareDepth` experiment). */
    readonly share?: ShareChoice;
    readonly space?: ColorSpaceId;
    readonly size?: SizeProfileId;
}

function drawLevel(rng: Rng, allowed: readonly WeightLevel[]): WeightLevel {
    return rng.weighted(allowed, (level) => LEVEL_ODDS[level]);
}

/**
 * At least `CONFIG.recipe.minActiveFamilies` non-anchor families stay on: a bare x/y vocabulary
 * only draws gradients.
 */
export function randomRecipe(rng: Rng, options: RandomRecipeOptions = {}): Recipe {
    for (let attempt = 0; attempt < 1000; attempt++) {
        const levels = {} as Record<FamilyId, WeightLevel>;

        for (const family of FAMILY_IDS) {
            levels[family] = drawLevel(rng, family === 'anchors' ? ANCHOR_LEVELS : WEIGHT_LEVELS);
        }

        const active = FAMILY_IDS.filter(
            (family) => family !== 'anchors' && levels[family] !== 'off',
        ).length;

        if (active < CONFIG.recipe.minActiveFamilies) {
            continue;
        }

        return {
            levels,
            size: options.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)],
            share: options.share ?? SHARE_CHOICES[rng.int(SHARE_CHOICES.length)],
            space: options.space ?? COLOR_SPACE_IDS[rng.int(COLOR_SPACE_IDS.length)],
        };
    }

    throw new Error('Randomart: randomRecipe could not draw a usable recipe');
}

export interface SampledRecipe {
    readonly recipe: Recipe;
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
}

export interface SampleRecipesOptions extends RandomRecipeOptions {
    readonly baseSeed?: number;
    readonly seedsPerGrammar?: number;
}

const MAX_DEDUPE_ATTEMPTS = 50;

/** Deterministic, deduplicated draw of recipes, each with its own seeds. */
export function sampleRecipes(
    catalog: Catalog,
    count: number,
    options: SampleRecipesOptions = {},
): SampledRecipe[] {
    const {
        baseSeed = CONFIG.sampling.baseSeed,
        seedsPerGrammar = CONFIG.sampling.benchSeedsPerGrammar,
        ...pins
    } = options;
    const seen = new Set<string>();
    const sampled: SampledRecipe[] = [];

    for (let i = 0; i < count; i++) {
        const rng = createRng(deriveSeed(baseSeed, i));
        let recipe = randomRecipe(rng, pins);

        for (
            let attempt = 0;
            seen.has(recipeKey(recipe)) && attempt < MAX_DEDUPE_ATTEMPTS;
            attempt++
        ) {
            recipe = randomRecipe(rng, pins);
        }

        seen.add(recipeKey(recipe));
        sampled.push({
            recipe,
            grammar: recipeToGrammar(catalog, recipe),
            seeds: Array.from({ length: seedsPerGrammar }, (_, k) =>
                deriveSeed(baseSeed ^ 0x5bd1_e995, i * seedsPerGrammar + k),
            ),
        });
    }

    return sampled;
}

/** Exact inverse of `recipeToGrammar`; `null` when the grammar is not a point of the space. */
export function recipeOf(grammar: Grammar): Recipe | null {
    const levels = {} as Record<FamilyId, WeightLevel>;

    for (const family of FAMILY_IDS) {
        const weights = FAMILY_OPERATORS[family].map((name) => weightOf(grammar.weights, name));
        const level = WEIGHT_LEVELS.find((candidate) =>
            weights.every((weight) => weight === LEVEL_WEIGHT[candidate]),
        );

        if (!level || (family === 'anchors' && !ANCHOR_LEVELS.includes(level))) {
            return null;
        }

        levels[family] = level;
    }

    const { minDepth, maxDepth, maxNodes } = grammar.constraints;
    const size = SIZE_PROFILE_IDS.find((id) => {
        const profile = SIZE_PROFILES[id];

        return (
            profile.minDepth === minDepth &&
            profile.maxDepth === maxDepth &&
            profile.maxNodes === maxNodes
        );
    });
    const { shareDepth, space } = grammar.channels;
    const share = shareDepth >= maxDepth ? 'mono' : SHARE_CHOICES.find((c) => c === shareDepth);

    if (!size || share === undefined) {
        return null;
    }

    return { levels, size, share, space };
}
