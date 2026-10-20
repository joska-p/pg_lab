import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { LEVEL_WEIGHT, levelOf, recipeKey, recipeToGrammar, stepRecipe } from './quantized.ts';
import type { Recipe } from './types.ts';

const catalog = createDefaultCatalog();
const rngAt = (seed: number) => createRng(createSeed(seed));
const ALLOWED = new Set(Object.values(LEVEL_WEIGHT));

const base: Recipe = {
    levels: { x: '1', y: '1', max: '1', min: '1', add: '1', gt: '1', warp: '1' },
    size: 'medium',
    share: 2,
    space: 'oklch',
};

const indexOf = (level: string) => Number(level);

describe('stepRecipe', () => {
    it('is deterministic for a given rng seed', () => {
        const a = stepRecipe(catalog, base, rngAt(1));
        const b = stepRecipe(catalog, base, rngAt(1));

        expect(recipeKey(a)).toBe(recipeKey(b));
    });

    it('moves each operator by at most one notch', () => {
        for (let seed = 1; seed <= 100; seed++) {
            const stepped = stepRecipe(catalog, base, rngAt(seed));

            for (const name of Object.keys(base.levels) as (keyof typeof base.levels)[]) {
                const before = indexOf(levelOf(base, name));
                const after = indexOf(levelOf(stepped, name));

                expect(Math.abs(after - before)).toBeLessThanOrEqual(1);
            }
        }
    });

    it('never leaves the grid and always yields a usable grammar', () => {
        let current = base;

        for (let seed = 1; seed <= 200; seed++) {
            current = stepRecipe(catalog, current, rngAt(seed), { changeRate: 1 });

            for (const level of Object.values(current.levels)) {
                expect(ALLOWED.has(LEVEL_WEIGHT[level])).toBe(true);
            }

            expect(() =>
                generate(catalog, recipeToGrammar(catalog, current), createSeed(1)),
            ).not.toThrow();
        }
    });

    it('keeps the anchors live even at changeRate 1', () => {
        for (let seed = 1; seed <= 50; seed++) {
            const stepped = stepRecipe(catalog, base, rngAt(seed), { changeRate: 1 });

            expect(stepped.levels.x === '0' && stepped.levels.y === '0').toBe(false);
        }
    });

    it('rejects an invalid changeRate', () => {
        expect(() => stepRecipe(catalog, base, rngAt(1), { changeRate: 2 })).toThrow(/changeRate/);
    });
});
