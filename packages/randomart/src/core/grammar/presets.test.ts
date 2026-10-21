import { describe, expect, it } from 'vite-plus/test';

import { catalog } from '../catalog/default';
import { CONFIG } from '../config/config';
import { generate } from '../generator/generator';
import { createSeed } from '../random/seed';
import { constraintsOf, createGrammar } from './grammar';
import { GRAMMAR_PRESETS, presetIdOf } from './presets';

describe('GRAMMAR_PRESETS', () => {
    it('has unique ids and labels', () => {
        expect(new Set(GRAMMAR_PRESETS.map((preset) => preset.id)).size).toBe(
            GRAMMAR_PRESETS.length,
        );
        expect(new Set(GRAMMAR_PRESETS.map((preset) => preset.label)).size).toBe(
            GRAMMAR_PRESETS.length,
        );
    });

    it('states a weight for every operator of the catalog', () => {
        for (const preset of GRAMMAR_PRESETS) {
            for (const operator of catalog.operators()) {
                expect(Object.hasOwn(preset.grammar.weights, operator.name)).toBe(true);
            }
        }
    });

    it('gives grammars the generator can use', () => {
        for (const preset of GRAMMAR_PRESETS) {
            expect(() => generate(preset.grammar, createSeed(1))).not.toThrow();
            expect(preset.grammar.shareDepth).toBeLessThanOrEqual(
                constraintsOf(preset.grammar.size).maxDepth,
            );
        }
    });

    it('is recognized by presetIdOf', () => {
        for (const preset of GRAMMAR_PRESETS) {
            expect(presetIdOf(preset.grammar)).toBe(preset.id);
        }
    });

    it('reports an undefined id once a knob moved', () => {
        const base = GRAMMAR_PRESETS[0].grammar;
        const moved = createGrammar({
            weights: base.weights,
            size: 'large',
            shareDepth: base.shareDepth,
            space: base.space,
        });

        expect(presetIdOf(moved)).toBeUndefined();
    });

    it('keeps the first preset as found: x and y at the top, min and max at 2', () => {
        const { grammar } = GRAMMAR_PRESETS[0];

        expect(grammar.weights.x).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.y).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.max).toBe(2);
        expect(grammar.weights.min).toBe(2);
        expect(grammar.size).toBe('medium');
    });
});
