import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { CONFIG } from '../config/config';
import { generate } from '../generator/generator';
import { createSeed } from '../random/seed';
import { constraintsOf, createGrammar } from './grammar';
import { grammarPresets, presetIdOf } from './presets';

const catalog = createDefaultCatalog();
const presets = grammarPresets(catalog);

describe('grammarPresets', () => {
    it('has unique ids and labels', () => {
        expect(new Set(presets.map((preset) => preset.id)).size).toBe(presets.length);
        expect(new Set(presets.map((preset) => preset.label)).size).toBe(presets.length);
    });

    it('states a weight for every operator of the catalog', () => {
        for (const preset of presets) {
            for (const operator of catalog.operators()) {
                expect(Object.hasOwn(preset.grammar.weights, operator.name)).toBe(true);
            }
        }
    });

    it('gives grammars the generator can use', () => {
        for (const preset of presets) {
            expect(() => generate(catalog, preset.grammar, createSeed(1))).not.toThrow();
            expect(preset.grammar.shareDepth).toBeLessThanOrEqual(
                constraintsOf(preset.grammar.size).maxDepth,
            );
        }
    });

    it('is recognized by presetIdOf', () => {
        for (const preset of presets) {
            expect(presetIdOf(catalog, presets, preset.grammar)).toBe(preset.id);
        }
    });

    it('reports an undefined id once a knob moved', () => {
        const base = presets[0].grammar;
        const moved = createGrammar(catalog, {
            weights: base.weights,
            size: 'large',
            shareDepth: base.shareDepth,
            space: base.space,
        });

        expect(presetIdOf(catalog, presets, moved)).toBeUndefined();
    });

    it('keeps the first preset as found: x and y at the top, min and max at 2', () => {
        const { grammar } = presets[0];

        expect(grammar.weights.x).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.y).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.max).toBe(2);
        expect(grammar.weights.min).toBe(2);
        expect(grammar.size).toBe('medium');
    });
});
