import type { Catalog, OperatorId } from '../catalog/index.ts';
import { COLOR_SPACE_IDS } from '../color/index.ts';
import type { ColorSpaceId } from '../color/index.ts';
import { CONFIG } from '../config/index.ts';
import type { SizeProfileId, WeightLevel } from '../config/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import type { Rng, Seed } from '../random/index.ts';
import { createGrammar } from './grammar.ts';
import type { ConstraintsInput, FamilyId, Grammar, Recipe, ShareChoice } from './types.ts';

/**
 * The quantized weight grid: an operator weight is always one of `CONFIG.recipe.levels`' values,
 * and a level's index is its weight (`level '2'` = weight 2). A `Recipe` is the coordinate of a
 * grammar on that grid — one level per operator, plus the size/share/color axes — and
 * `recipeToGrammar` is the only way down to a real `Grammar`. "One notch away" is meaningful here,
 * which it is not on continuous weights.
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

/** The spatial anchors, treated as one unit: a recipe must keep at least one of them live. */
export const ANCHOR_OPERATORS: readonly OperatorId[] = FAMILY_OPERATORS.anchors;

/** Every catalog operator, in family order — the canonical iteration order of a recipe. */
const ALL_OPERATORS: readonly OperatorId[] = FAMILY_IDS.flatMap(
    (family) => FAMILY_OPERATORS[family],
);

export type { SizeProfileId, WeightLevel } from '../config/index.ts';

/**
 * Level ids in draw order: they come from the config entry order, which `drawRecipe` consumes
 * through the PRNG — append new entries in `CONFIG.recipe`, never reorder.
 */
export const WEIGHT_LEVELS = Object.keys(CONFIG.recipe.levels) as readonly WeightLevel[];
export const SIZE_PROFILE_IDS = Object.keys(CONFIG.recipe.sizeProfiles) as readonly SizeProfileId[];

/** The "weight 1" level: an operator that is simply present, neither favoured nor backgrounded. */
export const NEUTRAL_LEVEL: WeightLevel = '1';
/** The "weight 0" level: the operator is not in the vocabulary. */
export const OFF_LEVEL: WeightLevel = '0';

/** The slider index a level sits at (its position on the grid). */
export function levelIndexOf(level: WeightLevel): number {
    return WEIGHT_LEVELS.indexOf(level);
}

/** The level at a slider index, clipped to the grid. */
export function levelAt(index: number): WeightLevel {
    const clipped = Math.min(WEIGHT_LEVELS.length - 1, Math.max(0, Math.round(index)));

    return WEIGHT_LEVELS[clipped] ?? NEUTRAL_LEVEL;
}

/** The level an operator sits at; an absent entry reads as `NEUTRAL_LEVEL`. */
export function levelOf(recipe: Recipe, name: OperatorId): WeightLevel {
    return recipe.levels[name] ?? NEUTRAL_LEVEL;
}

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
 * Levels anchors (x/y) may be drawn at — the `allowsAnchors` flags of `CONFIG.recipe.levels`: a
 * random draw keeps both anchors live, without x/y the image has no spatial variation. The
 * authoring UI may still switch one anchor off, as long as the other stays on.
 */
export const ANCHOR_LEVELS: readonly WeightLevel[] = WEIGHT_LEVELS.filter(
    (level) => CONFIG.recipe.levels[level].allowsAnchors,
);

/** Depth/node budgets per size — the values live in `CONFIG.recipe.sizeProfiles`. */
const SIZE_PROFILES: Record<SizeProfileId, ConstraintsInput> = CONFIG.recipe.sizeProfiles;

export const SHARE_CHOICES = [0, 1, 2, 3, 'mono'] as const;

/** Stable identity, for deduplication and caches. */
export function recipeKey(recipe: Recipe): string {
    return JSON.stringify([
        ...ALL_OPERATORS.map((name) => levelOf(recipe, name)),
        recipe.size,
        recipe.share,
        recipe.space,
    ]);
}

/** The grammar weights a recipe implies: the pure grid mapping, no validation. */
export function recipeWeights(recipe: Recipe): Partial<Record<OperatorId, number>> {
    const weights: Partial<Record<OperatorId, number>> = {};

    for (const name of ALL_OPERATORS) {
        weights[name] = LEVEL_WEIGHT[levelOf(recipe, name)];
    }

    return weights;
}

/**
 * Brings a raw recipe into the space — repair, not check, per the editing-quantity policy of
 * shared/index.ts: an unknown level id reads as `NEUTRAL_LEVEL`, an unknown size profile as
 * `'medium'`, and the structural invariants the grammar level would otherwise refuse are fixed here
 * by raising the alphabetically first candidate to `NEUTRAL_LEVEL`:
 *
 * 1. At least one anchor (x/y) stays live — without x/y the image has no spatial variation;
 * 2. At least one terminal stays active (for the stock catalog those are the anchors, but the rule is
 *    stated generically over the catalog's terminals).
 */
export function repairRecipe(catalog: Catalog, recipe: Recipe): Recipe {
    const levels: Partial<Record<OperatorId, WeightLevel>> = {};

    for (const name of ALL_OPERATORS) {
        const level = recipe.levels[name];

        levels[name] = level !== undefined && WEIGHT_LEVELS.includes(level) ? level : NEUTRAL_LEVEL;
    }

    if (ANCHOR_OPERATORS.every((name) => levels[name] === OFF_LEVEL)) {
        levels[ANCHOR_OPERATORS[0]] = NEUTRAL_LEVEL;
    }

    const activeTerminal = (): OperatorId | undefined =>
        ALL_OPERATORS.find(
            (name) => catalog.operator(name).isTerminal && levels[name] !== OFF_LEVEL,
        );

    if (!activeTerminal()) {
        const firstTerminal = ALL_OPERATORS.find((name) => catalog.operator(name).isTerminal);

        if (firstTerminal !== undefined) {
            levels[firstTerminal] = NEUTRAL_LEVEL;
        }
    }

    return {
        levels,
        size: SIZE_PROFILE_IDS.includes(recipe.size) ? recipe.size : 'medium',
        share: recipe.share,
        space: recipe.space,
    };
}

export function recipeToGrammar(catalog: Catalog, recipe: Recipe): Grammar {
    const repaired = repairRecipe(catalog, recipe);
    const constraints = SIZE_PROFILES[repaired.size];
    const shareDepth = repaired.share === 'mono' ? constraints.maxDepth : repaired.share;

    return createGrammar(catalog, {
        weights: recipeWeights(repaired),
        constraints,
        channels: { space: repaired.space, shareDepth },
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
 * A random point of the grid, drawn family by family: one level per family, applied to all its
 * operators. The per-level odds (`CONFIG.recipe.levels`) are the prior — a uniform per-operator
 * draw would mostly land on degenerate vocabularies. Per-operator variety comes from the walk
 * (`stepRecipe`) and from editing.
 *
 * At least `CONFIG.recipe.minActiveOperators` non-anchor operators stay on: a bare x/y vocabulary
 * only draws gradients.
 */
export function drawRecipe(rng: Rng, options: RandomRecipeOptions = {}): Recipe {
    for (let attempt = 0; attempt < 1000; attempt++) {
        const levels = {} as Record<OperatorId, WeightLevel>;

        for (const family of FAMILY_IDS) {
            const level = drawLevel(rng, family === 'anchors' ? ANCHOR_LEVELS : WEIGHT_LEVELS);

            for (const name of FAMILY_OPERATORS[family]) {
                levels[name] = level;
            }
        }

        const active = ALL_OPERATORS.filter(
            (name) => !ANCHOR_OPERATORS.includes(name) && levels[name] !== OFF_LEVEL,
        ).length;

        if (active < CONFIG.recipe.minActiveOperators) {
            continue;
        }

        return {
            levels,
            size: options.size ?? SIZE_PROFILE_IDS[rng.int(SIZE_PROFILE_IDS.length)],
            share: options.share ?? SHARE_CHOICES[rng.int(SHARE_CHOICES.length)],
            space: options.space ?? COLOR_SPACE_IDS[rng.int(COLOR_SPACE_IDS.length)],
        };
    }

    throw new Error('Randomart: drawRecipe could not draw a usable recipe');
}

export interface StepRecipeOptions {
    /** Probability that one operator moves one notch. Default: `CONFIG.sampling.changeRate`. */
    readonly changeRate?: number;
    /** Operators never moved to `off`. Default: the anchors (x, y). */
    readonly keep?: readonly OperatorId[];
}

/**
 * One exploration step on the grid: each operator (in family order) moves one notch up or down with
 * probability `changeRate`, clipped at the edges — the grid walk that replaces the old continuous
 * weight scaling. `keep` operators never move to `off`. The structural invariants are restored by
 * `repairRecipe`, so the result is always a point of the space. Deterministic: one `rng.next()` per
 * operator, plus one per moving operator for its direction.
 */
export function stepRecipe(
    catalog: Catalog,
    recipe: Recipe,
    rng: Rng,
    options: StepRecipeOptions = {},
): Recipe {
    const changeRate = options.changeRate ?? CONFIG.sampling.changeRate;

    if (!Number.isFinite(changeRate) || changeRate < 0 || changeRate > 1) {
        throw new Error(
            `Randomart: changeRate must be a finite number in [0, 1], received ${changeRate}`,
        );
    }

    const keep = new Set(options.keep ?? ANCHOR_OPERATORS);
    const top = WEIGHT_LEVELS.length - 1;
    const levels: Partial<Record<OperatorId, WeightLevel>> = {};

    for (const name of ALL_OPERATORS) {
        const index = levelIndexOf(levelOf(recipe, name));
        let next = index;

        if (rng.next() < changeRate) {
            const up = rng.next() < 0.5;
            const floor = keep.has(name) ? Math.min(1, top) : 0;

            next = up ? Math.min(top, index + 1) : Math.max(floor, index - 1);
        }

        levels[name] = levelAt(next);
    }

    return repairRecipe(catalog, { ...recipe, levels });
}

export interface SampledRecipe {
    readonly recipe: Recipe;
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
}

/** Golden-ratio multiplicative hash: distinct indices give well-separated 32-bit seeds. */
export function deriveSeed(base: number, index: number): Seed {
    return createSeed((Math.imul(index + 1, 0x9e37_79b1) ^ base) >>> 0);
}

/** The image seeds of one sampled item: index-stable, so the whole sample is deterministic. */
export function itemSeeds(baseSeed: number, index: number, seedsPerItem: number): readonly Seed[] {
    return Array.from({ length: seedsPerItem }, (_, k) =>
        deriveSeed(baseSeed ^ 0x5bd1_e995, index * seedsPerItem + k),
    );
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
        let recipe = drawRecipe(rng, pins);

        for (
            let attempt = 0;
            seen.has(recipeKey(recipe)) && attempt < MAX_DEDUPE_ATTEMPTS;
            attempt++
        ) {
            recipe = drawRecipe(rng, pins);
        }

        seen.add(recipeKey(recipe));
        sampled.push({
            recipe,
            grammar: recipeToGrammar(catalog, recipe),
            seeds: itemSeeds(baseSeed, i, seedsPerGrammar),
        });
    }

    return sampled;
}

/** Exact inverse of `recipeToGrammar`; `null` when the grammar is not a point of the space. */
export function recipeOf(grammar: Grammar): Recipe | null {
    const levels = {} as Record<OperatorId, WeightLevel>;

    for (const family of FAMILY_IDS) {
        for (const name of FAMILY_OPERATORS[family]) {
            const weight = grammar.weights[name] ?? 0;
            const level = WEIGHT_LEVELS.find((candidate) => LEVEL_WEIGHT[candidate] === weight);

            if (level === undefined) {
                return null;
            }

            levels[name] = level;
        }
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
